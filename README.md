# AKGEC Hostel Leave Portal — Frontend

React + Vite + Tailwind CSS · Role-based dashboards for all 6 user types

## Quick Start

```bash
# 1. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

## Tech Stack
- **React 18** + React Router v6
- **Vite** (build tool)
- **Tailwind CSS v3** (utility-first styling)
- **Axios** (API client with JWT interceptor)
- **react-hot-toast** (toast notifications)
- **lucide-react** (icons)
- **date-fns** (date formatting)

## Project Structure
```
src/
├── api/
│   ├── client.js          # Axios instance with JWT interceptor
│   └── services.js        # All API calls by module
├── context/
│   └── AuthContext.jsx    # Global auth state
├── hooks/
│   └── useApi.js          # Data fetching hook
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx    # Navigation sidebar (role-aware)
│   │   └── RouteGuard.jsx # Public/protected route wrappers
│   └── ui/
│       ├── StatusBadge.jsx      # Leave status chip
│       ├── ApprovalTimeline.jsx # The glowing stage timeline
│       ├── Modal.jsx            # Reusable modal
│       └── Spinner.jsx          # Loading states
└── pages/
    ├── auth/         Login, Register
    ├── student/      Dashboard, ApplyLeave, StudentLeaves, LeaveDetail
    ├── warden/       Dashboard, Pending, History, ApproveRejectModal
    ├── dean/         Dashboard, Pending, History
    ├── security/     Dashboard, QR Scan, On-Leave list
    ├── admin/        Dashboard, Users, Students, Reports, Audit
    └── parent/       ParentResponse (no login, post email redirect)
```

## Build for Production

## Deploy to Vercel
```
