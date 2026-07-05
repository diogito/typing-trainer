# Capability: Posture Calibration

## Purpose

Provide users with a calibration page to set ergonomic posture parameters and optional break reminders.

---

### R-UI-1: PostureCalibration type MUST define calibration parameters

The `PostureCalibration` type in `src/types/index.ts` MUST include the following fields:
- `armSeparation: number` — desk armrest separation in cm (range: 20–80, default: 40)
- `wristHeight: number` — monitor/wrist height level (range: 1–10, default: 5)
- `breakIntervalMinutes: number` — break reminder interval in minutes (range: 5–120, default: 30)
- `breakEnabled: boolean` — whether break reminders are active (default: false)

**Scenario**: Default posture calibration
**Given** no calibration has been set
**When** `PostureCalibration` defaults are used
**Then** `armSeparation` is 40, `wristHeight` is 5, `breakIntervalMinutes` is 30, `breakEnabled` is false

---

### R-UI-2: Slider component MUST render interactive range control

The `Slider` component in `src/components/ui/slider.tsx` MUST render a styled range input with:
- A track background
- A filled track segment from min to current value
- A thumb (circle) at the current value position
- A label showing the current value
- `min`, `max`, `defaultValue`, `step` props (all numbers)

**Scenario**: Slider renders at default value
**Given** a Slider with `min={1}`, `max={10}`, `defaultValue={5}`, `step={1}`
**When** rendered
**Then** the thumb is positioned at 50% of track width, label shows "5"

---

### R-UI-3: PosturePage MUST display 3 calibration sliders

The `PosturePage` component MUST render three sliders:
- "Arm Separation" — range 20–80 cm, step 1 cm
- "Monitor Height" — range 1–10 levels, step 1
- "Break Interval" — range 5–120 minutes, step 5 minutes

Each slider MUST display its label, current value, and unit (cm, level, min).

**Scenario**: PosturePage renders all sliders
**Given** user navigates to `/posture`
**When** PosturePage renders
**Then** three labeled sliders are visible with correct ranges and units

---

### R-UI-4: PosturePage MUST save calibration to IndexedDB

When the user clicks the Save button, `PosturePage` MUST call `postureStore.save()` which persists the calibration to IndexedDB.

**Scenario**: Save calibration
**Given** user set sliders to 60cm, level 7, 45min interval
**When** user clicks "Save"
**Then** `postureStore.save()` writes to IndexedDB POSTURE store
**And** a success toast or confirmation appears

---

### R-UI-5: PosturePage MUST reset to defaults

When the user clicks Reset, all sliders return to defaults and the store clears IndexedDB data.

**Scenario**: Reset to defaults
**Given** user has saved custom values
**When** user clicks "Reset"
**Then** sliders return to 40cm, level 5, 30min, break disabled
**And** POSTURE store in IndexedDB is cleared

---

## Capability: Break Reminder

---

### R-Reminder-1: BreakReminder timer MUST fire at configured interval

When `breakEnabled` is true and `breakIntervalMinutes` > 0, a timer MUST fire after each interval.

**Scenario**: Break reminder fires
**Given** breakEnabled is true and breakIntervalMinutes is 30
**When** 30 minutes of typing session time has elapsed
**Then** a break reminder overlay appears

---

### R-Reminder-2: BreakReminder overlay MUST be dismissible

The break reminder overlay MUST be dismissible by the user.

**Scenario**: Dismiss break reminder
**Given** break reminder overlay is displayed
**When** user clicks "Dismiss" or presses Escape
**Then** the overlay is hidden
**And** the timer resets to fire after the next interval

---

### R-Reminder-3: BreakReminder MUST pause when session is not running

The break timer MUST only count down during active typing sessions.

**Scenario**: Timer pauses during idle
**Given** break reminder timer is 15 minutes into a 30-minute interval
**When** the user stops and starts a new session
**Then** the timer continues from 15 minutes (does not reset or jump)

---

## Capability: IndexedDB Storage

---

### R-DB-1: IndexedDB schema MUST be upgraded to version 2

The IndexedDB database in `src/services/storage.ts` MUST bump its version from 1 to 2 and create a `POSTURE` object store on upgrade.

**Scenario**: DB version upgrade
**Given** the database exists at version 1 with stores: sessions, preferences, layouts
**When** the app loads with version 2
**Then** the `POSTURE` object store is created
**And** existing data in sessions, preferences, and layouts is preserved

---

### R-DB-2: storageService MUST provide POSTURE CRUD methods

The `storageService` MUST expose:
- `getPostureCalibration(): Promise<PostureCalibration | null>`
- `savePostureCalibration(calibration: PostureCalibration): Promise<void>`
- `deletePostureCalibration(): Promise<void>`

**Scenario**: Save and retrieve posture calibration
**Given** no calibration has been saved
**When** `savePostureCalibration({ armSeparation: 50, wristHeight: 6, breakIntervalMinutes: 45, breakEnabled: true })` is called
**Then** `getPostureCalibration()` returns `{ armSeparation: 50, wristHeight: 6, breakIntervalMinutes: 45, breakEnabled: true }`

---
