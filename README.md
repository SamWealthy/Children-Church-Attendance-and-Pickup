# JHT Children Church Attendance and Pickup MVP

Offline-friendly laptop web app for church children check-in and pickup.

## How to open

Double-click `index.html` in this folder. No server or internet connection is required.

## What it does

- Loads 100 sample children for simulation.
- Generates 12 weeks of sample history for testing analysis.
- Uses a service-date calendar to view or manage any date.
- Searches by child name, class, guardian, phone, or pickup code.
- Filters children by class.
- Checks children in and generates a pickup code.
- Prints a simple pickup card.
- Checks children out only after entering the matching pickup code.
- Shows live attendance counts and children present by class.
- Shows attendance history, average attendance, busiest class, and pickup completion.
- Shows each child's attendance history and attendance rate.
- Exports the selected date's attendance as a CSV file.
- Generates a selected-date service report with summary, class totals, attendance details, absentees, and care notes.
- Includes a saved light/dark mode toggle.
- Uses a responsive layout for phones, tablets, and laptops.
- Lets you add or edit children.
- Imports students from an Excel-compatible CSV register.
- Exports the student list as a CSV register.
- Saves data in the browser on the laptop using local storage.

## Student register import

Use `student-register-template.csv` or click `Template` inside the app.

Required columns:

- `name`
- `class`
- `guardian`

Optional columns:

- `phone`
- `collectors`
- `notes`

In Excel, fill the register, then choose `Save As` and use `CSV UTF-8 (*.csv)`. In the app, click `Import CSV`.

## Important note

Because this MVP saves data in the browser, use the same laptop and browser during a service. Export the CSV after service if you need a permanent attendance record.
