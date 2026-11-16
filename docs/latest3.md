# Latest Changes (3) — 2026-11-15

Covers what is in the current working tree but **not** documented in `Latest.md` (leave edit/delete, dashboard badge) or `latest2.md` (queue "no appointments" discussion).

---

## 1. Queue Management — Session Open / Close (implemented)

`latest2.md` was only a discussion with a proposed `PATCH /doctors/schedules/{id}/start` and a `sessionStatus` field. What actually shipped is different.

### API (`src/services/api.ts`)
- `openQueueSession(doctorScheduleId)` — `POST /doctors/schedules/:id/session`
- `closeQueueSession(doctorScheduleId)` — `PATCH /doctors/schedules/:id/session`
- Both use `client` (not `api`) and return `r.data` directly

### Types (`src/services/types.ts`)
- `SessionUser` — `{ id, name, emailAddress }`
- `DoctorScheduleSession` — `id`, `sessionDate` (`YYYY-MM-DD`), `status: 'open' | 'closed'`, `openedAt`, `closedAt`, `openedByRole`, `closedByRole`, `opener`, `closer`, timestamps
- `OpenSessionResponse` / `CloseSessionResponse` — `{ success, message?, data: DoctorScheduleSession }`
- `QueueScreenState` — `'NOT_STARTED' | 'OPEN' | 'CLOSED'`
- `QueueSSEData.session: DoctorScheduleSession | null` — `null` means not opened today (replaces the proposed `sessionStatus` string)

### State derivation (`src/pages/QueueManagement.tsx`)
- New `sessionStateMap` keyed by `${selectedId}-${sessionIdx}`, written from each SSE message
- New `sseReceivedKeys` ref — tracks which session keys have had at least one SSE message; the key is removed on SSE cleanup
- `queueScreenState`:

| SSE received? | `data.session` | State |
|---|---|---|
| No | — | `null` (unknown — nothing session-specific rendered, actions disabled) |
| Yes | `null` | `NOT_STARTED` |
| Yes | `status: 'open'` | `OPEN` |
| Yes | `status: 'closed'` | `CLOSED` |

- The `null` state avoids flashing "Start Session" on load before the server state is known

### UI
- **Start Session** button in the doctor actions bar (only in `NOT_STARTED`)
- **NOT_STARTED overlay** over the queue table — "Session Not Started" with its own Start Session button
- **Close Session** button (only in `OPEN`) → confirm modal ("cannot be undone") → `closeQueueSession`
- **Closed banner** (red) in `CLOSED` — "Session has been closed for today. The queue is now read-only." plus "Closed at HH:MM by {closer.name}" when available
- No manual state flip after open/close — UI waits for the SSE push
- Error handling: open → `409` toasts "Today's session has already been closed. It cannot be restarted."; close → `404` toasts "No active session to close."

### Gating changes (previously driven by `session.isLive`, now by `queueScreenState`)

| Element | Before | Now |
|---|---|---|
| Live badge on doctor card | `session.isLive` | `queueScreenState === 'OPEN'` |
| Instant / Scheduled Pause, Skip, Next Token | `session.isLive` | `queueScreenState === 'OPEN'` |
| Pause banner | `pausedDuration` | `OPEN && pausedDuration` |
| Scheduled pause banner | `scheduledPause` | `OPEN && scheduledPause` |
| "All patients consulted" banner | `allConsulted && session.isLive` | `allConsulted && OPEN` |
| "Queue hasn't started yet" banner | `!session.isLive` | `NOT_STARTED && !session.isLive` |

### Refactor
- All modal/loading/pause/toast/selectedPatient `useState` declarations moved above the SSE effect so the effect and `queueScreenState` can reference them
- `selectedPatient` typed as `Patient | null` (was `typeof patients[0] | null`)

### CSS (`src/pages/QueueManagement.css`)
- `.start-session-btn`, `.close-session-btn`, `.close-session-confirm-btn`
- `.session-closed-banner`, `.session-closed-dot`, `.session-closed-time`
- `.qm-session-overlay` (+ `-content`, `-icon`, `-title`, `-desc`, `-btn`)
- `.qm-table-wrapper { position: relative }` so the overlay can sit inside it

---

## 2. Dashboard — Correction to `Latest.md`

- `Latest.md` says `schedule.isLive` is true when the doctor has an `ongoing`/`done` appointment today. The code comment now says `isLive` comes from the **session table** on the backend (i.e. the queue session opened in §1), not appointment counts
- New CSS classes in `DashboardPage.css`: `.dbp-doctor-status.not-started` (amber `#B54708` / `#FFFAEB`) and `.dbp-doctor-status.on-leave` (purple `#6941C6` / `#F4F3FF`)
- Badges are hidden once current time is past the schedule end time (unchanged behaviour, but applies to all four states)

---

## 3. Leave Management — Details not in `Latest.md`

- `EditLeaveRequest` and `DeleteLeaveResponse` live in `src/services/types.ts` (Latest.md says `api.ts`)
- **Cancel** button guard also changed from `new Date(l.startDate) > new Date()` to `l.startDate >= todayStr` — so leaves starting **today** can now be cancelled (previously excluded by `>`)
- Edit modal: changing start/end date resets Half Day and session; start date auto-bumps end date if end < start; Half Day checkbox only shown when `isHalfDayEligible`
- Edit validation: dates required, reason required, session required when half day
- Edit errors: backend `errors[]` messages joined with ` · `, falling back to `message`; on failure the warning closes and the form re-opens with the error
- Delete confirm modal: "Keep Leave" / "Delete Leave", shows doctor name and date range, inline error on failure
- Opening Edit or Delete from the slide panel closes the panel first
- New `isManager` flag (`role === 'medical-center-manager'`)
- CSS: `.lm-edit-btn`, `.lm-delete-btn` (+ disabled state), `.lm-detail-actions`, `.lm-detail-action-btn`, `.lm-detail-edit-btn`, `.lm-detail-delete-btn`, `.lm-edit-doctor-display/-avatar/-name/-spec`

---

## 4. Known Issues / Cleanup Noticed

- `QueueManagement.tsx` — `handleSkip` body starts on the same line as its declaration (`async () => {    const ongoingIdx …`)
- `LeaveManagement.tsx` — `{/* Apply Leave Modal */}      {showApply && (` merged onto one line
- `LeaveManagement.tsx` — `setEditTarget(prev => prev)` in `handleEditSubmitClick` is a no-op
- `LeaveManagement.tsx` — inner Edit condition in the slide panel repeats the outer condition, so it is always true
- `.lm-edit-btn` / `.lm-delete-btn` CSS is unused (buttons are only in the slide panel, which uses `.lm-detail-*`)
- Open/close session errors other than `409` / `404` are swallowed silently
- Session error toasts use the green `verifyTickGreen` success icon
- Start/Close Session have no role check — any role that can see the queue can open/close it
