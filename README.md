# PPQ NPC Stat Cards

Google Apps Script project for authoring printable D&D 5e NPC stat cards.

## Overview

This project has two active surfaces:

1. Spreadsheet menu workflow (legacy, still supported)
- `Combat Tools > View Stat Card` opens `CombinedView.html`.
- `Combat Tools > Show Print Selector` opens `PrintSelector.html`, then print URL flow.
- `Combat Tools > Open NPC Editor` opens the standalone editor web app.

2. Standalone web editor (active default)
- `doGet()` serves `App.html` unless print params are passed.
- Reads/writes the same sheet tabs as the legacy flow.
- Keeps live front/back preview visible while editing.

## File map

- `Code.js`: server handlers, sheet I/O, print plumbing, web-app APIs.
- `App.html`: standalone editor UI, live preview, save, print.
- `StatCard.html`: front card template.
- `StatCardBack.html`: back card template.
- `PrintCards.html`: print layout template.
- `PrintSelector.html`: menu-based sheet selector.
- `CombinedView.html`: menu-based modal preview.
- `UI_HANDOFF.md`: UI architecture and handoff guidance.

## Editor architecture (current)

The editor now follows a shared compact row-editor language across sections:

1. Identity
- Name field.
- `Class` table rows: `Class Name | Level | Remove`.
- Class level is optional:
  - `+` from blank -> `1`
  - `-` at `1` -> blank
- `Size`, `Race / Type`, and `CR` row.
- `CR` uses sequence: blank -> `1/8` -> `1/4` -> `1/2` -> `1` -> `2`...

2. Combat Stats
- Core row: `AC | HP | Speed` (compact steppers).
- `Additional Movement Modes` row editor:
  - Columns: `Movement | Speed | Remove`
  - Movement types: `Climb`, `Swim`, `Fly`
  - Capped to 2 rows (sheet mapping constraint)

3. Defenses
- Separate `Damage` and `Conditions` subsections.
- Damage rows: `Type | Effect | Roll Mod | Remove`.
- Condition rows: `Condition | Effect | Remove`.
- Add/remove is repeatable-row based; dynamic adds append new rows to the draft payload.

4. Attributes
- Matrix rows: `Stat | Score | Modifier | Save | Save Flag`.
- `Modifier` is derived/read-only visual output.
- `Score` and `Save` are editable steppers.

5. Skills & Senses
- Compact summary row: `Proficiency | Initiative | Pass Perception | Vision`.
- Skills table rows: `Skill | Mod | Adv | Remove`.
- `Proficiency Bonus` is positive-only optional:
  - blank -> `+` seeds `1`
  - decrement at `1` clears to blank
- `Passive Perception` defaults to `10`; blank stepper interactions reseed from `10`.
- Blank `Vision` still renders as `normal` on card output.

6-8. Actions / Bonus Actions / Reactions
- Flat repeated rows (no collapsible card editor now):
  - `Name | Prefixes | Description | Suffixes | Remove`
- Name auto-renders as bold with trailing colon in output.
- Prefixes/suffixes are comma-separated in-editor and auto-bracketed in output.
- Description has row-local `Aa` and symbol popovers for selection formatting/symbol insert.

9. Spells (dual mode)
- Casting mode selector:
  - `Slot Casting`
  - `Per-Spell Uses`

Slot Casting rows:
- `Level | Slots | Spells | Remove`
- Level uses `C` for cantrip (`0` internal).
- Slots stepper is disabled for cantrip rows.
- Default visible row seeds as `Level 1` with blank slots.

Per-Spell Uses rows:
- `Uses | Spells | Remove`
- Uses uses infinity sentinel:
  - internal `-1` displayed as `infinity`
  - decrement from `1` -> `infinity`
  - increment from `infinity` -> `1`

10. Special
- Same row shape as actions, plus `New Line` checkbox column:
  - `New Line | Name | Prefixes | Description | Suffixes | Remove`
- First visible row cannot start with `New Line` (forced false/disabled).
- `New Line = FALSE` appends with dot separator; `TRUE` starts a new line.

## Data model and persistence contract

Spreadsheet remains source of truth (columns `B:E`, row `2+`):

- `B`: row label/category
- `C`: primary value
- `D`: secondary value
- `E`: tertiary value

`App.html` behavior:

- Reads `B:E` raw rows and parses into section models.
- Saves a full `B:E` draft payload back through `webApp_saveData`.
- Preserves existing sheet labels/mappings where possible.

Important structural updates:

- Spells now persist mode row:
  - `Spell Casting Mode` in col B, value in col C (`Slot Casting` or `Per-Spell Uses`)
- Per-use spell rows persist as:
  - `Per-Spell Uses` label rows (`C = uses`, `D = spells`)
- Damage/conditions/special dynamic add can append new labeled rows into the draft payload before save.

## Output behavior (preview and print)

Parity goal: editor preview and printed output should match.

Key output rules:

- Subtitle: `Class . Size Race/Type . CR N` (CR omitted when blank).
- Movement variants render under SPD stack.
- Save flags render with symbols (`adv`/`disadv` triangles).
- Spell names render italicized.
- Slot casting top brackets render in grouped triplets:
  - `[L1/L2/L3] [L4/L5/L6] [L7/L8/L9]` (as needed)
- Per-Spell Uses mode does not render top slot brackets.

## Development notes

- Main UI work happens in `App.html`.
- Keep spreadsheet/menu print flow backward compatible.
- Avoid changing card dimensions/print template structure unless explicitly requested.

Deploy/push:

```bash
clasp push
```

## Known constraints and TODOs

- Spreadsheet-coupled persistence is still intentional for now.
- Additional movement remains capped at 2 rows due current sheet-mapped model.
- Desktop-first authoring is prioritized over mobile/tablet layout.
- Future direction: deprecate spreadsheet-coupled editing only after sustained app stability.
