# JobTrack — Job Application Tracker

A React + Vite + Tailwind CSS app for tracking job applications, built with localStorage for persistence and no backend required.

---

## File Hierarchy

```
job-application-tracker/
├── public/                     # Static assets (favicon, etc.)
├── src/
│   ├── main.jsx                # Entry point — mounts <App /> into the DOM
│   ├── index.css               # Global styles — imports Tailwind + Google Fonts
│   ├── App.jsx                 # Root component — layout, navigation, modal state
│   │
│   ├── components/
│   │   ├── JobList.jsx         # Applications table view with search, filter, sort
│   │   ├── JobForm.jsx         # Add / edit modal form
│   │   └── StatsPage.jsx       # Stats dashboard with donut chart, funnel, timeline
│   │
│   ├── hooks/
│   │   └── useJobs.js          # Custom hook — all job data logic + localStorage
│   │
│   └── utils/
│       └── statusConfig.js     # Status labels, colors, and chart color constants
│
├── index.html                  # HTML shell — Vite injects the app here
├── vite.config.js              # Vite config — React plugin, Tailwind plugin, dev server
└── package.json                # Dependencies and npm scripts
```

---

## How React Works in This App

### The entry point

`main.jsx` is where the app boots. It imports the root `<App />` component and renders it into the `<div id="root">` element in `index.html`:

```jsx
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(<App />)
```

Everything you see in the browser is ultimately rendered by this one line.

---

### Component tree

React apps are built as a tree of components — each one is a function that returns JSX (HTML-like syntax). Here's how this app is structured:

```
<App />
├── <aside>          — Sidebar navigation (inline in App.jsx)
├── <JobList />      — Shown when view === "applications"
├── <StatsPage />    — Shown when view === "stats"
└── <JobForm />      — Modal, shown when showForm === true
```

`App.jsx` is the "controller" — it decides which view to show and passes data and functions down to its children.

---

### State — how data changes over time

State is a variable that, when changed, causes React to re-render the component. Declared with `useState`:

```jsx
const [view, setView] = useState("applications")
```

- `view` is the current value (`"applications"` or `"stats"`)
- `setView` is the function you call to change it
- When `setView("stats")` is called, React re-renders `<App />` and swaps `<JobList />` for `<StatsPage />`

This app uses several pieces of state in `App.jsx`:

| State | What it controls |
|---|---|
| `view` | Which page is shown (applications or stats) |
| `showForm` | Whether the add/edit modal is open |
| `editingJob` | Which job is being edited (null = adding new) |

---

### The custom hook — `useJobs.js`

All job data logic lives in a custom hook. Hooks are just functions that use React's built-in hooks internally. `useJobs` manages:

- **Loading** jobs from `localStorage` on first render
- **Saving** jobs back to `localStorage` whenever they change (via `useEffect`)
- **CRUD operations** — `addJob`, `updateJob`, `deleteJob`

```js
const { jobs, addJob, updateJob, deleteJob } = useJobs()
```

`App.jsx` calls this once and passes the data and functions down to child components as **props**.

---

### Props — passing data between components

Props are how a parent component talks to a child. They look like HTML attributes:

```jsx
<JobList jobs={jobs} onEdit={handleEdit} onDelete={deleteJob} />
```

Inside `JobList.jsx`, these are received as a parameter:

```jsx
export default function JobList({ jobs, onEdit, onDelete }) {
  // jobs = array of application objects
  // onEdit = function to call when edit button clicked
  // onDelete = function to call when delete confirmed
}
```

The data flows **down** (parent → child via props) and events flow **up** (child calls a function passed from parent).

---

### Conditional rendering

React renders different UI based on state values using ternary operators or `&&`:

```jsx
// Show one page or the other
{view === "applications" ? <JobList ... /> : <StatsPage ... />}

// Only show the modal when open
{showForm && <JobForm ... />}
```

---

### The data flow — end to end

Here's what happens when you click **"Add Application"** and submit the form:

```
1. User clicks "Add Application" button in sidebar
         ↓
2. App.jsx: setShowForm(true) — modal opens
         ↓
3. <JobForm /> renders with no job prop (new entry mode)
         ↓
4. User fills out form and clicks "Add Application"
         ↓
5. JobForm calls onSubmit(formData) — passed down as a prop
         ↓
6. App.jsx: handleFormSubmit() runs → calls addJob(data) from useJobs
         ↓
7. useJobs: adds new job to state array → useEffect saves to localStorage
         ↓
8. React re-renders → new row appears in <JobList />
         ↓
9. App.jsx: setShowForm(false) — modal closes
```

---

### How localStorage persistence works

In `useJobs.js`, `useEffect` watches the `jobs` array and syncs it to `localStorage` every time it changes:

```js
useEffect(() => {
  localStorage.setItem("jobtrack_applications", JSON.stringify(jobs))
}, [jobs])
```

On first load, the initial state reads from `localStorage`:

```js
const [jobs, setJobs] = useState(() => {
  const stored = localStorage.getItem("jobtrack_applications")
  return stored ? JSON.parse(stored) : SAMPLE_JOBS
})
```

This means your data survives page refreshes with zero backend.

---

## Development

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Build for production → dist/
npm run preview   # Preview the production build locally
```

---

## Adding Features

| Feature | Where to start |
|---|---|
| New status type | Add to `statusConfig.js` |
| New field (e.g. job URL) | Add to `JobForm.jsx` form + `JobList.jsx` table |
| New chart | Add to `StatsPage.jsx` |
| Sync across devices | Replace `useJobs.js` localStorage logic with Supabase calls |
| User accounts | Add Supabase Auth, wrap the app in an auth provider |
