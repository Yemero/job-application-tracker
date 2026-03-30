# JobTrack (Working Title)

A personal job application tracker built with React and Tailwind — log applications, track statuses, and visualize your job search pipeline.

No backend required. All data is stored in your browser via localStorage.


---

## Features

- Add, edit, and delete job applications
- Click any cell in the table to edit it inline
- Filter and search applications by status, company, or role
- Stats dashboard with a donut chart, conversion funnel, and weekly activity chart
- Data persists across sessions via localStorage

## Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- localStorage for persistence (no backend)

---

## Getting Started

```bash
npm install
npm run dev
```

App opens automatically at `http://localhost:5173`.

---

## Project Structure

```
src/
├── App.jsx                  # Root layout, navigation, modal state
├── components/
│   ├── ImportExport.jsx     # Import and export job data
│   ├── JobList.jsx          # Applications table with inline editing
│   ├── JobForm.jsx          # Add / edit modal form
│   └── StatsPage.jsx        # Charts and stats dashboard
├── hooks/
│   └── useJobs.js           # Data management + localStorage sync
└── utils/
    ├── formatSalay.jsx      # Text formatting for salary
    ├── importExport.jsx     # Reading & writing for exporting/importing data
    └── statusConfig.js      # Status labels, colors, chart colors

```

---

## Statuses

| Status                | Meaning                               |
|---                    |---                                    |
| Applied               | Submitted, no response yet            |
| Awaiting Reply        | Follow-up sent or response expected   |
| Interviewing          | Active in the interview process       |
| Interviewing Rejected | Rejected after interviews             |
| Offered               | Received an offer                     |
| Ghosted               | No response after a long time         |
| Rejected              | Explicitly rejected                   |

---

## Extending

| Goal                  | Where to look                         |
|---                    |---                                    |
| Add a new status      | `statusConfig.js`                     |
| Add a new field       | `JobForm.jsx` + `JobList.jsx`         |
| Add a new chart       | `StatsPage.jsx`                       |
| Sync across devices   | Replace `useJobs.js` with Supabase    |
| Add user accounts     | Supabase Auth + auth provider wrapper |
| Add verfication to importing & exporting |`importExport.jsx` in utils & components       |
| Update and improve UX and UI |  `components`  |


