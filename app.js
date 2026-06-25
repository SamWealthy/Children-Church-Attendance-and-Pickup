const STORAGE_KEY = "childrenChurchAttendance.v1";
const THEME_KEY = "childrenChurchAttendance.theme";

const state = {
  children: [],
  attendance: {},
  selectedId: null,
  classFilter: "All",
  query: "",
  editingId: null,
  selectedDate: todayKey(),
};

const els = {
  checkedInCount: document.querySelector("#checkedInCount"),
  collectedCount: document.querySelector("#collectedCount"),
  waitingCount: document.querySelector("#waitingCount"),
  totalCount: document.querySelector("#totalCount"),
  classFilters: document.querySelector("#classFilters"),
  childList: document.querySelector("#childList"),
  detailPanel: document.querySelector("#detailPanel"),
  classBoard: document.querySelector("#classBoard"),
  analysisBoard: document.querySelector("#analysisBoard"),
  historyTable: document.querySelector("#historyTable"),
  searchInput: document.querySelector("#searchInput"),
  serviceDateInput: document.querySelector("#serviceDateInput"),
  todayBtn: document.querySelector("#todayBtn"),
  addChildBtn: document.querySelector("#addChildBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  reportBtn: document.querySelector("#reportBtn"),
  themeToggleBtn: document.querySelector("#themeToggleBtn"),
  seedBtn: document.querySelector("#seedBtn"),
  historyDemoBtn: document.querySelector("#historyDemoBtn"),
  downloadTemplateBtn: document.querySelector("#downloadTemplateBtn"),
  importStudentsBtn: document.querySelector("#importStudentsBtn"),
  exportStudentsBtn: document.querySelector("#exportStudentsBtn"),
  studentFileInput: document.querySelector("#studentFileInput"),
  importStatus: document.querySelector("#importStatus"),
  resetDayBtn: document.querySelector("#resetDayBtn"),
  childDialog: document.querySelector("#childDialog"),
  childForm: document.querySelector("#childForm"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  cancelDialogBtn: document.querySelector("#cancelDialogBtn"),
  pickupDialog: document.querySelector("#pickupDialog"),
  pickupPhotoCard: document.querySelector("#pickupPhotoCard"),
  closePickupBtn: document.querySelector("#closePickupBtn"),
  printPickupBtn: document.querySelector("#printPickupBtn"),
  dialogTitle: document.querySelector("#dialogTitle"),
  rowTemplate: document.querySelector("#childRowTemplate"),
};

let currentPickupCard = null;

const firstNames = [
  "Amelia", "Noah", "Olivia", "Elijah", "Isla", "Joshua", "Ava", "Ethan", "Mia", "Samuel",
  "Sophia", "Daniel", "Grace", "David", "Lily", "Benjamin", "Hannah", "Isaac", "Ella", "Joseph",
  "Chloe", "Nathan", "Zara", "Jacob", "Ruby", "Caleb", "Freya", "Matthew", "Eva", "Aaron",
  "Sarah", "Toby", "Naomi", "Lucas", "Abigail", "Leo", "Sienna", "Michael", "Ivy", "Adam",
  "Jessica", "Reuben", "Aisha", "Joel", "Maya", "Gabriel", "Thea", "Luke", "Nia", "Owen",
  "Phoebe", "Jude", "Maryam", "Timi", "Esther", "Tolu", "Imani", "Kemi", "Ada", "Chinedu",
  "Amara", "Kofi", "Sade", "Kwame", "Zion", "Malachi", "Eden", "Ruth", "Peter", "Faith",
  "Hope", "Emmanuel", "Blessing", "Micah", "Victoria", "Jayden", "Harriet", "Simon", "Eliana", "Ryan",
  "Leah", "Andrew", "Mercy", "Dominic", "Yasmin", "Talia", "Rhema", "Tiana", "Ezekiel", "Lydia",
  "John", "Elizabeth", "Moses", "Clara", "Hugo", "Skye", "Miriam", "Tara", "Seth", "Jemima",
];

const lastNames = [
  "Adeyemi", "Williams", "Okafor", "Smith", "Adebayo", "Brown", "Johnson", "Mensah", "Osei", "Taylor",
  "Oluwatobi", "Wilson", "Adesina", "Campbell", "Roberts", "Afolayan", "Edwards", "Hughes", "Ogunleye", "Davies",
];

const classes = [
  "Creche", "Toddlers", "Reception", "Year 1-2", "Year 3-4", "Year 5-6", "Youth Prep",
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function selectedDateKey() {
  return state.selectedDate || todayKey();
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  els.themeToggleBtn.textContent = isDark ? "Light" : "Dark";
  els.themeToggleBtn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    children: state.children,
    attendance: state.attendance,
  }));
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    seedDemoChildren();
    return;
  }

  try {
    const saved = JSON.parse(raw);
    state.children = saved.children || [];
    state.attendance = saved.attendance || {};
  } catch {
    seedDemoChildren();
  }
}

function seedDemoChildren() {
  const notes = ["", "", "", "Peanut allergy", "Asthma inhaler", "Gluten free", "Speak with parent before snack"];
  state.children = firstNames.map((firstName, index) => {
    const lastName = lastNames[index % lastNames.length];
    const guardianLast = lastNames[(index + 6) % lastNames.length];
    return {
      id: crypto.randomUUID(),
      name: `${firstName} ${lastName}`,
      className: classes[index % classes.length],
      guardian: `${index % 2 ? "Mr" : "Mrs"} ${guardianLast}`,
      phone: `07${String(300000000 + index * 73921).slice(0, 9)}`,
      collectors: [`${index % 2 ? "Mum" : "Dad"}`, "Church parent team"].join(", "),
      notes: notes[index % notes.length],
      createdAt: new Date().toISOString(),
    };
  });
  state.attendance = {};
  state.selectedId = state.children[0]?.id || null;
  save();
}

function getRecord(childId, dateKey = selectedDateKey()) {
  return state.attendance[dateKey]?.[childId] || null;
}

function setRecord(childId, patch) {
  const day = selectedDateKey();
  state.attendance[day] ||= {};
  state.attendance[day][childId] = {
    ...(state.attendance[day][childId] || {}),
    ...patch,
  };
  save();
  render();
}

function getStatus(childId) {
  const record = getRecord(childId);
  if (!record?.checkedInAt) return { label: "Not in", className: "status-away" };
  if (record.collectedAt) return { label: "Collected", className: "status-out" };
  return { label: "Present", className: "status-in" };
}

function makePickupCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function formatTime(value) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function timestampForSelectedDate(hour = null, minute = null) {
  const now = new Date();
  const h = hour ?? now.getHours();
  const m = minute ?? now.getMinutes();
  return new Date(`${selectedDateKey()}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`).toISOString();
}

function filteredChildren() {
  const q = state.query.trim().toLowerCase();
  return state.children
    .filter((child) => state.classFilter === "All" || child.className === state.classFilter)
    .filter((child) => {
      const record = getRecord(child.id);
      return [child.name, child.className, child.guardian, child.phone, child.collectors, record?.pickupCode]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderSummary() {
  const records = Object.values(state.attendance[selectedDateKey()] || {});
  const checkedIn = records.filter((record) => record.checkedInAt).length;
  const collected = records.filter((record) => record.collectedAt).length;
  els.checkedInCount.textContent = checkedIn;
  els.collectedCount.textContent = collected;
  els.waitingCount.textContent = checkedIn - collected;
  els.totalCount.textContent = state.children.length;
}

function renderFilters() {
  const classNames = ["All", ...new Set(state.children.map((child) => child.className).sort())];
  els.classFilters.innerHTML = "";
  classNames.forEach((className) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-chip${state.classFilter === className ? " active" : ""}`;
    button.textContent = className;
    button.addEventListener("click", () => {
      state.classFilter = className;
      render();
    });
    els.classFilters.append(button);
  });
}

function renderChildList() {
  const children = filteredChildren();
  els.childList.innerHTML = "";

  if (!children.length) {
    els.childList.innerHTML = `<div class="empty-state"><h2>No matches</h2><p>Try another name, class, guardian, or pickup code.</p></div>`;
    return;
  }

  children.forEach((child) => {
    const row = els.rowTemplate.content.firstElementChild.cloneNode(true);
    const status = getStatus(child.id);
    row.classList.toggle("selected", child.id === state.selectedId);
    row.querySelector(".avatar").textContent = initials(child.name);
    row.querySelector("strong").textContent = child.name;
    row.querySelector("small").textContent = `${child.className} - ${child.guardian}`;
    const pill = row.querySelector(".status-pill");
    pill.textContent = status.label;
    pill.classList.add(status.className);
    row.addEventListener("click", () => {
      state.selectedId = child.id;
      render();
    });
    els.childList.append(row);
  });
}

function renderDetail() {
  const child = state.children.find((item) => item.id === state.selectedId);
  if (!child) {
    els.detailPanel.innerHTML = `<div class="empty-state"><h2>Select a child</h2><p>Search or choose from the list to check in, generate a pickup code, or mark collection.</p></div>`;
    return;
  }

  const record = getRecord(child.id);
  const status = getStatus(child.id);
  const pickupCode = record?.pickupCode || "-----";
  const canCheckOut = record?.checkedInAt && !record?.collectedAt;

  els.detailPanel.innerHTML = `
    <div class="child-profile">
      <div class="profile-left">
        <span class="large-avatar">${initials(child.name)}</span>
        <div>
          <p class="eyebrow">${child.className}</p>
          <h2>${escapeHtml(child.name)}</h2>
        </div>
      </div>
      <span class="status-pill ${status.className}">${status.label}</span>
    </div>

    <div class="meta-grid">
      <div class="meta-card"><span>Guardian</span><strong>${escapeHtml(child.guardian)}</strong></div>
      <div class="meta-card"><span>Phone</span><strong>${escapeHtml(child.phone || "Not added")}</strong></div>
      <div class="meta-card"><span>Collectors</span><strong>${escapeHtml(child.collectors || "Guardian only")}</strong></div>
      <div class="meta-card"><span>Notes</span><strong>${escapeHtml(child.notes || "None")}</strong></div>
    </div>

    <div class="pickup-strip">
      <div>
        <p class="eyebrow">Pickup code</p>
        <div class="pickup-code">${pickupCode}</div>
      </div>
      <div class="quick-actions">
        <button class="primary-button" id="checkInAction">${record?.checkedInAt ? "Reissue code" : "Check in"}</button>
        <button class="ghost-button" id="showCodeAction" ${record?.pickupCode ? "" : "disabled"}>Show code</button>
        <button class="ghost-button" id="printAction">Print card</button>
        <button class="primary-button" id="checkOutAction" ${canCheckOut ? "" : "disabled"}>Check out</button>
      </div>
    </div>

    <div class="quick-actions">
      <button class="ghost-button" id="editAction">Edit child</button>
      <button class="danger-button" id="removeAttendanceAction">Clear selected date</button>
    </div>

    <div class="timeline">
      <p><strong>Checked in:</strong> ${formatTime(record?.checkedInAt)}</p>
      <p><strong>Collected:</strong> ${formatTime(record?.collectedAt)}</p>
      <p><strong>Date:</strong> ${selectedDateKey()}</p>
    </div>
    ${renderChildHistory(child)}
  `;

  document.querySelector("#checkInAction").addEventListener("click", () => {
    const nextRecord = {
      checkedInAt: timestampForSelectedDate(),
      collectedAt: null,
      pickupCode: makePickupCode(),
    };
    setRecord(child.id, {
      ...nextRecord,
    });
    showParentPickupCard(child, nextRecord);
  });

  document.querySelector("#showCodeAction").addEventListener("click", () => showParentPickupCard(child, record));
  document.querySelector("#checkOutAction").addEventListener("click", () => {
    const code = prompt(`Enter pickup code for ${child.name}`);
    if (!code) return;
    if (code.trim().toUpperCase() !== record.pickupCode) {
      alert("Pickup code does not match.");
      return;
    }
    setRecord(child.id, { collectedAt: timestampForSelectedDate() });
  });

  document.querySelector("#printAction").addEventListener("click", () => printPickupCard(child, record));
  document.querySelector("#editAction").addEventListener("click", () => openChildDialog(child));
  document.querySelector("#removeAttendanceAction").addEventListener("click", () => clearAttendance(child.id));
}

function renderClassBoard() {
  els.classBoard.innerHTML = "";
  const classNames = [...new Set(state.children.map((child) => child.className).sort())];
  const presentByClass = classNames
    .map((className) => ({
      className,
      children: state.children
        .filter((child) => child.className === className)
        .filter((child) => {
          const record = getRecord(child.id);
          return record?.checkedInAt && !record?.collectedAt;
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.children.length);

  if (!presentByClass.length) {
    els.classBoard.innerHTML = `<div class="empty-state"><h2>No children checked in yet</h2><p>Checked-in children will appear here by class.</p></div>`;
    return;
  }

  presentByClass.forEach((group) => {
    const card = document.createElement("article");
    card.className = "class-card";
    card.innerHTML = `
      <h3>${escapeHtml(group.className)} (${group.children.length})</h3>
      <ul>
        ${group.children.map((child) => {
          const record = getRecord(child.id);
          return `<li><span>${escapeHtml(child.name)}</span><strong>${record.pickupCode}</strong></li>`;
        }).join("")}
      </ul>
    `;
    els.classBoard.append(card);
  });
}

function getServiceDates() {
  return Object.keys(state.attendance)
    .filter((dateKey) => Object.values(state.attendance[dateKey] || {}).some((record) => record.checkedInAt))
    .sort((a, b) => b.localeCompare(a));
}

function summarizeDate(dateKey) {
  const records = Object.values(state.attendance[dateKey] || {});
  const checkedIn = records.filter((record) => record.checkedInAt).length;
  const collected = records.filter((record) => record.collectedAt).length;
  const waiting = checkedIn - collected;
  const classCounts = {};

  state.children.forEach((child) => {
    const record = state.attendance[dateKey]?.[child.id];
    if (!record?.checkedInAt) return;
    classCounts[child.className] = (classCounts[child.className] || 0) + 1;
  });

  const busiestClass = Object.entries(classCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];

  return {
    checkedIn,
    collected,
    waiting,
    busiestClass: busiestClass ? `${busiestClass[0]} (${busiestClass[1]})` : "None",
  };
}

function renderChildHistory(child) {
  const serviceDates = getServiceDates();
  const childDates = serviceDates.filter((dateKey) => state.attendance[dateKey]?.[child.id]?.checkedInAt);
  const recentRows = childDates.slice(0, 6).map((dateKey) => {
    const record = state.attendance[dateKey][child.id];
    const status = record.collectedAt ? "Collected" : "Awaiting pickup";
    return `<li><span>${dateKey}</span><strong>${status}</strong></li>`;
  }).join("");
  const rate = serviceDates.length ? Math.round((childDates.length / serviceDates.length) * 100) : 0;

  return `
    <div class="mini-history">
      <h3>Student history</h3>
      <div class="meta-grid">
        <div class="meta-card"><span>Services attended</span><strong>${childDates.length}</strong></div>
        <div class="meta-card"><span>Attendance rate</span><strong>${rate}%</strong></div>
      </div>
      ${recentRows ? `<ul>${recentRows}</ul>` : `<p>No previous attendance recorded for this child.</p>`}
    </div>
  `;
}

function renderAnalysis() {
  const serviceDates = getServiceDates();
  const selectedSummary = summarizeDate(selectedDateKey());
  const totalAttendance = serviceDates.reduce((sum, dateKey) => sum + summarizeDate(dateKey).checkedIn, 0);
  const averageAttendance = serviceDates.length ? Math.round(totalAttendance / serviceDates.length) : 0;
  const pickupRate = selectedSummary.checkedIn
    ? Math.round((selectedSummary.collected / selectedSummary.checkedIn) * 100)
    : 0;

  els.analysisBoard.innerHTML = `
    <article class="analysis-card"><span>Recorded services</span><strong>${serviceDates.length}</strong></article>
    <article class="analysis-card"><span>Average attendance</span><strong>${averageAttendance}</strong></article>
    <article class="analysis-card"><span>Busiest class on date</span><strong>${selectedSummary.busiestClass}</strong></article>
    <article class="analysis-card"><span>Pickup completion</span><strong>${pickupRate}%</strong></article>
  `;

  if (!serviceDates.length) {
    els.historyTable.innerHTML = `<div class="empty-state"><h2>No history yet</h2><p>Use the app over several services or click Demo history to simulate records.</p></div>`;
    return;
  }

  els.historyTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Checked in</th>
          <th>Collected</th>
          <th>Awaiting pickup</th>
          <th>Busiest class</th>
        </tr>
      </thead>
      <tbody>
        ${serviceDates.map((dateKey) => {
          const summary = summarizeDate(dateKey);
          return `
            <tr>
              <td><button class="history-link" data-date="${dateKey}" type="button">${dateKey}</button></td>
              <td>${summary.checkedIn}</td>
              <td>${summary.collected}</td>
              <td>${summary.waiting}</td>
              <td>${summary.busiestClass}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;

  els.historyTable.querySelectorAll(".history-link").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDate = button.dataset.date;
      els.serviceDateInput.value = state.selectedDate;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function render() {
  els.serviceDateInput.value = selectedDateKey();
  renderSummary();
  renderFilters();
  renderChildList();
  renderDetail();
  renderClassBoard();
  renderAnalysis();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function normalizeHeader(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mapStudentRows(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeHeader);
  const aliases = {
    name: ["name", "child", "childname", "student", "studentname", "fullname"],
    className: ["class", "classname", "group", "room"],
    guardian: ["guardian", "parent", "parentguardian", "parentname", "guardianname"],
    phone: ["phone", "mobile", "telephone", "contact", "contactnumber"],
    collectors: ["collectors", "authorizedcollectors", "authorisedcollectors", "pickuppeople", "collection"],
    notes: ["notes", "medicalnotes", "allergies", "specialnotes"],
  };

  const indexFor = (field) => aliases[field].map((alias) => headers.indexOf(alias)).find((index) => index >= 0);
  const indexes = {
    name: indexFor("name"),
    className: indexFor("className"),
    guardian: indexFor("guardian"),
    phone: indexFor("phone"),
    collectors: indexFor("collectors"),
    notes: indexFor("notes"),
  };

  return rows.slice(1)
    .map((row) => ({
      id: crypto.randomUUID(),
      name: (row[indexes.name] || "").trim(),
      className: (row[indexes.className] || "").trim(),
      guardian: (row[indexes.guardian] || "").trim(),
      phone: (row[indexes.phone] || "").trim(),
      collectors: (row[indexes.collectors] || "").trim(),
      notes: (row[indexes.notes] || "").trim(),
      createdAt: new Date().toISOString(),
    }))
    .filter((child) => child.name && child.className && child.guardian);
}

function openChildDialog(child = null) {
  state.editingId = child?.id || null;
  els.dialogTitle.textContent = child ? "Edit child" : "Add child";
  els.childForm.elements.namedItem("name").value = child?.name || "";
  els.childForm.elements.namedItem("className").value = child?.className || "";
  els.childForm.elements.namedItem("guardian").value = child?.guardian || "";
  els.childForm.elements.namedItem("phone").value = child?.phone || "";
  els.childForm.elements.namedItem("collectors").value = child?.collectors || "";
  els.childForm.elements.namedItem("notes").value = child?.notes || "";
  els.childDialog.showModal();
}

function saveChildFromForm(event) {
  event.preventDefault();
  const form = new FormData(els.childForm);
  const child = {
    name: form.get("name").trim(),
    className: form.get("className").trim(),
    guardian: form.get("guardian").trim(),
    phone: form.get("phone").trim(),
    collectors: form.get("collectors").trim(),
    notes: form.get("notes").trim(),
  };

  if (state.editingId) {
    state.children = state.children.map((item) => item.id === state.editingId ? { ...item, ...child } : item);
    state.selectedId = state.editingId;
  } else {
    const newChild = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...child };
    state.children.push(newChild);
    state.selectedId = newChild.id;
  }

  els.childDialog.close();
  save();
  render();
}

function clearAttendance(childId) {
  const day = selectedDateKey();
  if (!state.attendance[day]?.[childId]) return;
  if (!confirm("Clear the check-in record for this child on the selected date?")) return;
  delete state.attendance[day][childId];
  save();
  render();
}

function resetDay() {
  if (!confirm("Reset all check-ins and collections for the selected date?")) return;
  delete state.attendance[selectedDateKey()];
  save();
  render();
}

function downloadStudentTemplate() {
  downloadCsv("children-church-student-template.csv", [
    ["name", "class", "guardian", "phone", "collectors", "notes"],
    ["Amelia Adeyemi", "Reception", "Mrs Johnson", "07123456789", "Mum, Dad, Church parent team", "Peanut allergy"],
    ["Noah Williams", "Year 1-2", "Mr Brown", "07987654321", "Dad", ""],
  ]);
}

function exportStudents() {
  const rows = [["name", "class", "guardian", "phone", "collectors", "notes"]];
  state.children
    .slice()
    .sort((a, b) => a.className.localeCompare(b.className) || a.name.localeCompare(b.name))
    .forEach((child) => {
      rows.push([child.name, child.className, child.guardian, child.phone, child.collectors, child.notes]);
    });
  downloadCsv("children-church-students.csv", rows);
}

function importStudentsFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const rows = parseCsv(String(reader.result || ""));
    const imported = mapStudentRows(rows);

    if (!imported.length) {
      els.importStatus.textContent = "No valid students found. Required columns: name, class, guardian.";
      return;
    }

    const replace = confirm(`Found ${imported.length} students. Press OK to replace the current student list, or Cancel to add them to the existing list.`);
    state.children = replace ? imported : [...state.children, ...imported];
    state.selectedId = imported[0]?.id || state.selectedId;
    state.classFilter = "All";
    els.importStatus.textContent = `${imported.length} students imported from ${file.name}.`;
    save();
    render();
  });
  reader.readAsText(file);
}

function generateDemoHistory() {
  const anchor = new Date(`${todayKey()}T12:00:00`);
  const day = anchor.getDay();
  const daysSinceSunday = day === 0 ? 0 : day;
  anchor.setDate(anchor.getDate() - daysSinceSunday);

  for (let week = 0; week < 12; week += 1) {
    const serviceDate = new Date(anchor);
    serviceDate.setDate(anchor.getDate() - (week * 7));
    const dateKey = serviceDate.toISOString().slice(0, 10);
    state.attendance[dateKey] = {};

    state.children.forEach((child, index) => {
      const classOffset = classes.indexOf(child.className) * 0.03;
      const attends = Math.random() < 0.62 + classOffset || (index + week) % 9 === 0;
      if (!attends) return;

      const checkMinute = 5 + ((index * 3 + week * 7) % 45);
      const collectedMinute = 5 + ((index * 5 + week * 4) % 45);
      const checkedInAt = new Date(`${dateKey}T10:${String(checkMinute).padStart(2, "0")}:00`).toISOString();
      const collectedAt = Math.random() < 0.96
        ? new Date(`${dateKey}T12:${String(collectedMinute).padStart(2, "0")}:00`).toISOString()
        : null;

      state.attendance[dateKey][child.id] = {
        checkedInAt,
        collectedAt,
        pickupCode: makePickupCode(),
      };
    });
  }

  state.selectedDate = anchor.toISOString().slice(0, 10);
  save();
  render();
}

function exportAttendance() {
  const rows = [[
    "Date", "Child", "Class", "Guardian", "Phone", "Pickup Code", "Checked In", "Collected", "Notes",
  ]];

  state.children
    .slice()
    .sort((a, b) => a.className.localeCompare(b.className) || a.name.localeCompare(b.name))
    .forEach((child) => {
      const record = getRecord(child.id);
      rows.push([
        selectedDateKey(),
        child.name,
        child.className,
        child.guardian,
        child.phone,
        record?.pickupCode || "",
        record?.checkedInAt ? formatTime(record.checkedInAt) : "",
        record?.collectedAt ? formatTime(record.collectedAt) : "",
        child.notes,
      ]);
    });

  downloadCsv(`children-attendance-${selectedDateKey()}.csv`, rows);
}

function generateServiceReport() {
  const dateKey = selectedDateKey();
  const summary = summarizeDate(dateKey);
  const classNames = [...new Set(state.children.map((child) => child.className).sort())];
  const presentChildren = state.children
    .filter((child) => getRecord(child.id, dateKey)?.checkedInAt)
    .sort((a, b) => a.className.localeCompare(b.className) || a.name.localeCompare(b.name));
  const absentChildren = state.children
    .filter((child) => !getRecord(child.id, dateKey)?.checkedInAt)
    .sort((a, b) => a.className.localeCompare(b.className) || a.name.localeCompare(b.name));
  const notesChildren = presentChildren.filter((child) => child.notes);
  const pickupRate = summary.checkedIn ? `${Math.round((summary.collected / summary.checkedIn) * 100)}%` : "0%";

  const rows = [
    ["JHT Children Church Attendance and Pickup"],
    ["Service Report"],
    ["Date", dateKey],
    [],
    ["Summary"],
    ["Registered children", state.children.length],
    ["Checked in", summary.checkedIn],
    ["Collected", summary.collected],
    ["Awaiting pickup", summary.waiting],
    ["Pickup completion", pickupRate],
    ["Busiest class", summary.busiestClass],
    [],
    ["Class totals"],
    ["Class", "Registered", "Checked in", "Collected", "Awaiting pickup"],
  ];

  classNames.forEach((className) => {
    const registered = state.children.filter((child) => child.className === className).length;
    const classPresent = state.children.filter((child) => child.className === className && getRecord(child.id, dateKey)?.checkedInAt);
    const classCollected = classPresent.filter((child) => getRecord(child.id, dateKey)?.collectedAt).length;
    rows.push([className, registered, classPresent.length, classCollected, classPresent.length - classCollected]);
  });

  rows.push(
    [],
    ["Attendance details"],
    ["Child", "Class", "Guardian", "Phone", "Pickup code", "Checked in", "Collected", "Status", "Notes"],
  );

  presentChildren.forEach((child) => {
    const record = getRecord(child.id, dateKey);
    rows.push([
      child.name,
      child.className,
      child.guardian,
      child.phone,
      record.pickupCode,
      formatTime(record.checkedInAt),
      record.collectedAt ? formatTime(record.collectedAt) : "",
      record.collectedAt ? "Collected" : "Awaiting pickup",
      child.notes,
    ]);
  });

  rows.push(
    [],
    ["Children not present"],
    ["Child", "Class", "Guardian", "Phone"],
  );

  absentChildren.forEach((child) => {
    rows.push([child.name, child.className, child.guardian, child.phone]);
  });

  rows.push(
    [],
    ["Notes and care checks"],
    ["Child", "Class", "Guardian", "Phone", "Notes"],
  );

  notesChildren.forEach((child) => {
    rows.push([child.name, child.className, child.guardian, child.phone, child.notes]);
  });

  downloadCsv(`jht-service-report-${dateKey}.csv`, rows);
}

function showParentPickupCard(child, record) {
  if (!record?.pickupCode) {
    alert("Check the child in first to generate a pickup code.");
    return;
  }

  currentPickupCard = { child, record };
  els.pickupPhotoCard.innerHTML = `
    <p class="eyebrow">JHT Children Church Pickup</p>
    <h2>${escapeHtml(child.name)}</h2>
    <div class="photo-code">${record.pickupCode}</div>
    <div class="photo-meta">
      <span>${escapeHtml(child.className)}</span>
      <span>${selectedDateKey()} - ${formatTime(record.checkedInAt)}</span>
    </div>
    <div class="photo-note">Show this code at collection</div>
  `;
  els.pickupDialog.showModal();
}

function printPickupCard(child, record) {
  if (!record?.pickupCode) {
    alert("Check the child in first to generate a pickup code.");
    return;
  }

  const popup = window.open("", "pickup-card", "width=420,height=520");
  popup.document.write(`
    <html>
      <head>
        <title>Pickup Card</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 26px; }
          .card { border: 2px solid #111; padding: 24px; text-align: center; }
          h1 { margin: 0 0 10px; font-size: 24px; }
          .code { font-size: 56px; font-weight: 900; letter-spacing: 6px; margin: 18px 0; }
          p { margin: 8px 0; font-size: 17px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>JHT Children Church Pickup</h1>
          <div class="code">${record.pickupCode}</div>
          <p><strong>${escapeHtml(child.name)}</strong></p>
          <p>${escapeHtml(child.className)}</p>
          <p>${selectedDateKey()} - ${formatTime(record.checkedInAt)}</p>
        </div>
        <script>window.print();<\/script>
      </body>
    </html>
  `);
  popup.document.close();
}

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

els.serviceDateInput.addEventListener("change", (event) => {
  state.selectedDate = event.target.value || todayKey();
  render();
});

els.todayBtn.addEventListener("click", () => {
  state.selectedDate = todayKey();
  render();
});

els.addChildBtn.addEventListener("click", () => openChildDialog());
els.childForm.addEventListener("submit", saveChildFromForm);
els.closeDialogBtn.addEventListener("click", () => els.childDialog.close());
els.cancelDialogBtn.addEventListener("click", () => els.childDialog.close());
els.closePickupBtn.addEventListener("click", () => els.pickupDialog.close());
els.printPickupBtn.addEventListener("click", () => {
  if (!currentPickupCard) return;
  printPickupCard(currentPickupCard.child, currentPickupCard.record);
});
els.exportBtn.addEventListener("click", exportAttendance);
els.reportBtn.addEventListener("click", generateServiceReport);
els.themeToggleBtn.addEventListener("click", toggleTheme);
els.seedBtn.addEventListener("click", () => {
  if (!confirm("Replace current children with 100 demo children?")) return;
  seedDemoChildren();
  render();
});
els.downloadTemplateBtn.addEventListener("click", downloadStudentTemplate);
els.exportStudentsBtn.addEventListener("click", exportStudents);
els.importStudentsBtn.addEventListener("click", () => els.studentFileInput.click());
els.studentFileInput.addEventListener("change", (event) => {
  importStudentsFromFile(event.target.files[0]);
  event.target.value = "";
});
els.historyDemoBtn.addEventListener("click", () => {
  if (!confirm("Generate 12 weeks of demo attendance records?")) return;
  generateDemoHistory();
});
els.resetDayBtn.addEventListener("click", resetDay);

loadTheme();
load();
render();
