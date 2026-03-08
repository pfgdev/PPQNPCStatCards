# UI Handoff: NPC Stat Card Editor

Use this as the source of truth for UI work in `App.html`.

## Product context

This is a desktop-first power-user authoring tool for compact D&D NPC cards.
The priority is fast structured entry with persistent preview, not decorative form design.

## Milestone status

- `v0.8` baseline is considered near-stable for authoring + print:
  - unified standalone preview/print renderer path
  - print cut-border behavior restored for card cutting
  - spreadsheet persistence unchanged

## Non-negotiables

- Preserve spreadsheet save/read behavior (B:E row model).
- Preserve card output behavior and print workflow compatibility.
- Keep live preview visible beside the editor.
- Preserve row-editor consistency across repeated sections.
- Avoid section-specific one-off control styles unless unavoidable.

## Current implementation baseline (as-built)

## 0. Library (Home View)

- NPC library cards now provide two actions:
  - `Open Editor`
  - `Select for Print` / `Unselect`
- Top controls include:
  - search filter
  - `Print Card Page`
  - `New NPC`
  - `Refresh List`
- Print behavior:
  - if one or more NPCs are selected, those are used
  - otherwise, currently visible (filtered) NPC tabs are used
  - current print template supports one page (up to 4 cards)
- Standalone app print uses the same front/back renderer functions as live preview
  (`buildFrontCardHtml`, `buildBackCardHtml`) to minimize preview/print drift.
- Legacy `PrintCards.html` remains for spreadsheet menu compatibility only.

## Shared visual grammar

- Most repeated data uses compact row editors with:
  - explicit header row
  - fixed/intended column widths
  - dedicated far-right remove action
  - compact add-row action below list
- Shared numeric control is integrated `- value +` stepper.
- Remove actions are hidden when only one visible row remains.
- Placeholder color is standardized across regular and rich-text controls.

## 1. Identity

- `Name` at top.
- `Class` subsection uses table rows:
  - `Class Name | Level | Remove`
- Class level behavior (optional):
  - blank `+` -> `1`
  - `1` then `-` -> blank
  - `>1` then `-` decrements normally
- Bottom row fields:
  - `Size` dropdown
  - `Race / Type` text
  - `CR` stepper
- CR sequence:
  - blank -> `1/8` -> `1/4` -> `1/2` -> `1` -> `2`...

## 2. Combat Stats

- Core top row:
  - `AC | HP | Speed`
- `Additional Movement Modes` is a compact row editor:
  - `Movement | Speed | Remove`
- Movement row count is capped at 2 (sheet mapping constraint).
- Movement maps to `Climb Speed`, `Swim Speed`, `Fly Speed`.

## 3. Defenses

- Separate `Damage` and `Conditions` subsections.
- Damage rows:
  - `Type | Effect | Roll Mod | Remove`
- Condition rows:
  - `Condition | Effect | Remove`
- Damage types include `Magical` and `Physical` (alphabetized in list).
- Damage and condition rows support dynamic append on add.

## 4. Attributes

- Matrix layout:
  - `Stat | Score | Modifier | Save | Save Flag`
- `Modifier` is derived and visually demoted (not an editable box).
- `Score` and `Save` use editable steppers.
- `Save Flag` supports advantage/disadvantage dropdown.

## 5. Skills & Senses

- Compact summary controls:
  - `Proficiency | Initiative | Pass Perception | Vision`
- Skills rows:
  - `Skill | Mod | Adv | Remove`
- Skill dropdown uses full D&D skill names.
- Vision is compact freeform text (`e.g. 60dv, 10bs`).
- Blank vision output defaults to `normal`.
- Value behavior:
  - Proficiency cannot go negative; blank + seeds `1`; decrement at `1` clears.
  - Passive Perception defaults/normalizes from `10`.

## 6. Actions / 7. Bonus Actions / 8. Reactions

- Flat repeated-row editor (no collapsible nested card editor):
  - `Name | Prefixes | Description | Suffixes | Remove`
- Output behavior:
  - Name auto-bold + colon.
  - Prefixes/suffixes are comma-separated in editor, auto-bracketed in output.
- Description includes row-local compact controls:
  - `Aa` popover (bold/italic/underline/clear formatting)
  - symbol popover (resistance/vulnerability/immunity/adv/disadv symbols)
- Popovers render above local row controls and must not be clipped.
- Description placeholder intentionally demonstrates italicized dice-roll pattern.

## 9. Spells

- Mode selector:
  - `Slot Casting`
  - `Per-Spell Uses`
- Both mode tables are width-aligned to avoid mode-switch layout shift.

Slot Casting rows:
- `Level | Slots | Spells | Remove`
- Level sequence `C` (cantrip) through `9`.
- Slots blank is allowed; first increment seeds to `1`.
- Cantrip rows disable slots.
- One default visible row starts as `Level 1` with blank slots.

Per-Spell Uses rows:
- `Uses | Spells | Remove`
- Uses sequence:
  - `infinity` <-> `1` <-> `2` ...
  - down from `1` goes to `infinity`
  - up from `infinity` goes to `1`

Spell output rules:
- Slot mode:
  - top grouped slot brackets by triplets (`[1/2/3]`, `[4/5/6]`, `[7/8/9]`) as needed
  - levels only render when slot count > 0
  - cantrips render as `[C] ...`
- Uses mode:
  - no top slot bracket line
  - one line per row with bold use marker (`[N each]` or `[infinity]`)

## 10. Special

- Same row language as actions with added first column:
  - `New Line | Name | Prefixes | Description | Suffixes | Remove`
- First visible row cannot enable `New Line`.
- When `New Line` is false, entries join prior line with dot separator.

## Data and mapping contract

- Parser reads `B:E` rows and maps known labels into section models.
- Save writes a full edited draft payload (usually `B:E`) back to sheet.
- Existing labels are preserved; editor does not rely on a separate DB schema.
- Structural additions currently used:
  - `Spell Casting Mode`
  - `Per-Spell Uses` rows
- Dynamic add currently appends rows for:
  - `Damage`
  - `Conditions`
  - `Special`

## Known constraints

- Additional movement intentionally limited to 2 rows.
- Spreadsheet is still the persistence backbone.
- Desktop density/alignment is preferred over mobile responsiveness.

## Phase 2 backlog (next)

- Reuse action description popover controls/components in other authoring areas (for example Special variants where appropriate).
- Continue standardizing row-editor shells to avoid pseudo-duplicate CSS blocks.
- Audit any remaining micro-misalignment between row headers and row bodies before style polish.
- Long-term: plan deprecation path for spreadsheet-coupled persistence after proven stability.
- Print profiles:
  - add mode-specific output options for digital-play pages vs fold/sleeve physical card sheets.
