# PPQ NPC Stat Cards

Google Apps Script project for creating printable DnD 5e NPC stat cards from a spreadsheet.

## Core constraints
- Card size is fixed at `2.5in x 3.5in`.
- Card visual structure should not change unless explicitly requested.
- Existing spreadsheet/menu print workflow must remain functional while the standalone editor evolves.

## Current app modes
1. Spreadsheet menu workflow (legacy + still active)
- `Combat Tools > View Stat Card` opens modal preview (`CombinedView.html`).
- `Combat Tools > Show Print Selector` opens `PrintSelector.html`, then print web URL.

2. Standalone web editor (active default)
- `doGet()` serves `App.html` by default.
- URL launch is supported directly (no spreadsheet menu required).
- Editor reads/writes the same sheet tabs.

## File map
- `Code.js`: backend parsing, sheet I/O, menu items, web handlers.
- `App.html`: standalone editor UI + live preview + save + print.
- `StatCard.html`: front card template.
- `StatCardBack.html`: back card template.
- `PrintCards.html`: print layout grid.
- `PrintSelector.html`: sheet picker for menu-based print flow.
- `CombinedView.html`: modal front/back preview from spreadsheet menu.

## Data source and write model
- Source of truth is spreadsheet tabs (`B:E`, starting row 2).
- UI writes only columns `C:E`; column `B` labels are preserved.
- Save path updates existing rows; it does not alter sheet structure.

### Key mappings in current editor
- Name: blank is saved as `--`.
- Class: multi-entry editor, saved as a single string like `Monk 8 / Barbarian 3`.
- AC/HP/Speed: numeric steppers with defaults (`10 / 10 / 25`).
- Additional speeds: two UI variants (`type + value`) mapped back to:
  - `Climb Speed`
  - `Swim Speed`
  - `Fly Speed`
- Size: dropdown (`Tiny` to `Gargantuan`).
- Race field label: `Race / Type`.
- Damage:
  - Type dropdown (13 standard types + `Nonmagical Damage` + `Magical Damage`).
  - Effect (`Resistance/Vulnerability/Immunity`) + Roll Mod (`Advantage/Disadvantage`).
- Conditions:
  - Single effect flag (`Immunity/Advantage/Disadvantage`).
- Attributes:
  - 3x2 stat card editor layout.
  - Modifier is derived and readonly.
  - Save value editable.
  - Save flag dropdown (`Advantage/Disadvantage`) persists to save row flags.

## Print behavior
- `Print This NPC` in `App.html` sends current form-derived `cardData` to server.
- Server renders `PrintCards.html` using that data.
- Goal is parity between live preview and printed output.

## Deployment / push
- Local workflow uses `clasp`.
- Push latest changes:
```bash
clasp push
```

## Parallel handoff (for multiple Codex sessions)

### UI Codex ownership
Focus on `App.html` UI polish only:
- Spacing rhythm and alignment.
- Control ergonomics and visual consistency.
- Section layout/readability.
- Keep behavior intact unless explicitly requested.

### Data Codex ownership
Focus on `Code.js` + data handling behavior:
- Parsing/mapping correctness.
- Save/read fidelity.
- Schema normalization and migration helpers.
- Print/render data contract integrity.

### Coordination rules
- Avoid changing the same concerns in both sessions.
- If a UI tweak needs data changes, document it first in PR/commit note.
- Preserve backward compatibility with existing sheet tabs.

## Known active work areas
- Continue UI density/alignment polish in Identity, Combat Stats, and Defenses.
- Keep preview and print in sync as editor fields evolve.
- Gradually reduce legacy duplication where safe, without breaking menu flow.
