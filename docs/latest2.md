# Discussion — Queue Management: No Appointments on an Active Schedule

**Date:** 2026-11-13

---

## The Scenario

Dr. Jaison has a schedule today from 9am to 5pm and has already arrived at the clinic. However, no appointments have been booked yet for his session. Because of this, the queue is stuck showing "Not Started" with no way to progress.

---

## Root Cause (Frontend)

The current flow requires at least one appointment to exist before the queue can be started.

The "Start Now" / "Next Token" button is disabled when:
```ts
disabled={!session.isLive || !!pausedDuration || allConsulted || patients.length === 0}
```

`patients.length === 0` is the blocker. Even if that guard were removed, `handleConfirmStart()` looks for the first `pending` appointment to mark as `ongoing` — so without any appointments, clicking Start does nothing.

There is no concept of a "queue session state" independent of appointments. The only statuses that exist are at the appointment level: `pending`, `ongoing`, `done`, `skipped`, `cancelled`.

---

## Options Considered

### Option A — "Open Queue" button (Frontend only, Recommended short-term)
Add an **"Open Queue"** button visible when `session.isLive && patients.length === 0`.

- Sets a local `isQueueOpen` flag stored in `sessionStorage` keyed by `scheduleId`
- Changes the banner from grey "Not Started" to green "Queue is open — waiting for patients"
- When the first appointment arrives via SSE, the banner clears and the queue works as normal
- **Limitation:** Lost on page refresh, not synced across devices

### Option B — Remove `patients.length === 0` guard only
Un-greys the button but `handleConfirmStart` still fails silently — doesn't solve anything.

### Option C — Walk-in appointment creation from queue page
Add a quick "Add Walk-in Patient" button so staff can register a patient on the spot. Most complete solution but requires the full appointment creation flow.

---

## Message to Backend Developer

> **Subject: Queue Management — "Not Started" issue when doctor is present but no appointments exist**
>
> Hi,
>
> We have a situation in the Queue Management screen that needs your input.
>
> **The scenario:**
> Dr. Jaison has a schedule today from 9am to 5pm and has already arrived at the clinic. However, no appointments have been booked yet for his session. Because of this, the queue is stuck showing "Not Started" with no way to progress.
>
> **Root cause:**
> The current flow requires at least one appointment to exist before the queue can be started. The "Start Now" button is disabled when `patients.length === 0`. Even if we remove that guard, the `handleConfirmStart` function looks for the first `pending` appointment to mark as `ongoing` — so without any appointments, clicking Start does nothing.
>
> **What we need from the backend side:**
>
> 1. **Is there a concept of "queue session state" on the backend?**
>    Right now we only have appointment-level statuses (`pending`, `ongoing`, `done`, etc.). There's no API to mark a schedule/session itself as "open" or "in progress" independent of appointments. Do you have this, or can we add it?
>
> 2. **A suggested endpoint:**
>    Something like `PATCH /doctors/schedules/{scheduleId}/start` that marks the session as actively open — even before any appointments exist. The SSE stream (`/appointments/queue?doctorScheduleId={}`) could then include a `sessionStatus` field (e.g., `open`, `not_started`, `closed`) so the frontend can reflect the real state.
>
> 3. **Walk-in scenario:**
>    When a doctor is present and ready but no pre-booked patients exist, staff should be able to open the queue so walk-in patients can be registered. Right now the UI has no way to signal this readiness state.
>
> **Current workaround we're considering on frontend:**
> We can add a local "Open Queue" flag stored in `sessionStorage` keyed by `scheduleId`, which shows a "Queue is open — waiting for patients" banner. But this is lost on page refresh and isn't synced across devices (e.g., if a staff member opens it on one device, the doctor's screen won't reflect it). A backend solution would be the proper fix.
>
> **Questions for you:**
> - Can the schedule API return a `sessionStatus` or `isStarted` field?
> - Can we add an endpoint to explicitly open/close a session?
> - Should the SSE stream include session-level state, not just appointment-level data?
>
> Let me know your thoughts — happy to jump on a call to align on this.
>
> Thanks

---

## Ideal Backend Solution

| What | Detail |
|---|---|
| New field on schedule | `sessionStatus: 'not_started' \| 'open' \| 'closed'` returned by `GET /doctors/{id}/schedule` |
| New endpoint | `PATCH /doctors/schedules/{scheduleId}/start` — marks session as `open` |
| SSE update | `QueueSSEData` includes `sessionStatus` so all connected clients reflect the change in real time |
| Frontend change | "Open Queue" button calls the new endpoint; button/banner state driven by `sessionStatus` from SSE, not local state |
