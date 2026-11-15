# Latest Changes — 2026-11-11

## 1. Leave Management — Edit & Delete

### API (`src/services/api.ts`)
- Added `EditLeaveRequest` type — same fields as `ApplyLeaveRequest` minus `doctorId`
- Added `DeleteLeaveResponse` type — `{ success, message }`
- Added `editLeave(leaveId, body)` — `PUT /leaves/:id`
- Added `deleteLeave(leaveId)` — `DELETE /leaves/:id`

### UI (`src/pages/LeaveManagement.tsx`)
- Edit and Delete buttons are inside the **3-dots slide panel only** (not in the table row)
- **Edit** — available on `Pending` leaves for all roles; `Approved` leaves for `medical-center-manager` only
- **Delete** — available on `Pending` leaves for all roles; `Approved` leaves for `medical-center-manager` only
- Both require `startDate >= today` (date guard matches backend)
- Edit modal pre-fills doctor (read-only display), dates, half-day/session, and reason from the existing leave
- Two-step flow for both Edit and Delete: form/confirm → appointment warning → API call
- After a successful edit, the row and open detail panel both update in-place (no full refetch)
- After a successful delete, the row is removed and the detail panel closes if it was open for that leave

### Permission Matrix

| Status | startDate | Role | Edit | Delete |
|---|---|---|---|---|
| Pending | ≥ today | any | ✅ | ✅ |
| Approved | ≥ today | medical-center-manager | ✅ | ✅ |
| Approved | ≥ today | staff / doctor | ❌ | ❌ |
| Past / Rejected / Cancelled | any | any | ❌ | ❌ |

### Bug Fix — Date Guard
- Replaced `new Date(l.startDate) >= new Date()` with `l.startDate >= todayStr` throughout
- `YYYY-MM-DD` string comparison is timezone-safe; the old `Date` constructor parsed strings as UTC midnight which failed in IST (+5:30) making today's leaves invisible

---

## 2. Dashboard — Today's Active Doctors Status Badge

### Type update (`src/services/api.ts`)
- `todayDoctors[].schedules[]` now includes `tokenLimit: number` and `isLive: boolean`
- `todayDoctors[]` now includes `isOnLeave: boolean`

### Logic change (`src/pages/DashboardPage.tsx`)
- `isLive` badge was previously derived from `currentTime >= scheduleStartTime` (pure frontend time check) — this caused doctors to appear "Live" even before clicking Start in queue management
- Now driven by `schedule.isLive` from the backend — `true` only when the doctor has at least one appointment with `tokenStatus` of `ongoing` or `done` today
- `isOnLeave` is checked first and always wins over schedule-based status

### Four badge states

| Condition | Badge | Color |
|---|---|---|
| `isOnLeave = true` | • On leave | Purple |
| `isLive = true` | • Live | Green |
| `isLive = false` + current time ≥ startTime | • Not started | Amber |
| `isLive = false` + current time < startTime | • Booking open | Blue |
