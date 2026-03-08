# UI Handoff: NPC Stat Card Editor

This document defines the UI/UX direction for the stat card editor. Read this before making any editor-side UI changes.

---

## Product Context

This app is a **power-user authoring tool** for building printable D&D NPC stat cards.

The printable output is already strong and should remain the target artifact. The main weakness is the **editor experience**, which currently feels inconsistent, misaligned, overly vertical, and lacking shared component rules.

This is **not** a casual consumer card-maker. It should behave like a compact, efficient DM-facing content workstation.

### Desktop-first only
This editor is designed for desktop use only. Do not prioritize mobile or tablet responsiveness if it compromises desktop density, alignment, or authoring speed.

### Single expert user
The primary user is the creator of the cards and already understands the domain. The interface does not need to optimize for novice discoverability at the expense of speed and compactness.

### Creation-from-scratch workflow
Most usage starts from a blank NPC and builds upward. The editor should support a smooth top-to-bottom authoring flow with strong alignment and minimal wasted space.

### Live preview is mandatory
The preview must remain visible at all times during editing. It is a core part of the workflow, not an optional extra.

### Persistent preview column
Editor refactors must assume a persistent preview column remains visible beside the form. Do not solve layout problems by hiding, collapsing, or removing the preview.

### Preview/print parity is critical
The live preview should remain as close to 1:1 with the printed result as possible. Do not introduce preview-only styling or behavior that could diverge from the print output.

---

## Primary Goal

Refactor the editor so it feels:

- consistent
- aligned
- compact
- fast to scan
- fast to edit
- structurally reusable

The goal is not decorative polish first. The goal is **coherent form architecture**.

### Workflow Priority

Optimize the editor for fast sequential entry in this rough order:

1. Identity
2. Core combat stats
3. Defenses
4. Attributes
5. Skills & senses
6. Actions / bonus actions / reactions
7. Spells
8. Special

The interface should support efficient progression through those sections without feeling oversized or visually inconsistent.

---

## Non-Goals

Do **not**:

- redesign the printed stat card output
- change card size or card structure
- break existing save/read behavior
- rebuild the data model unless explicitly required
- add flashy styling that hides poor structure
- optimize for a mobile-first experience if it harms desktop authoring
- create section-specific one-off controls when a reusable component should exist

---

## Anti-Patterns to Avoid

Do **not** solve the editor by:

- adding random per-section spacing tweaks without a shared spacing system
- creating new one-off field styles for individual sections
- widening controls arbitrarily just to fill horizontal space
- replacing dense desktop-friendly layouts with oversized mobile-style cards
- making repeated sections visually inconsistent with one another
- changing field order casually without preserving mapping clarity and top-to-bottom authoring flow

---

## Current Problems

The current editor has several systemic issues:

1. **No shared UI grammar**
   - Labels, inputs, steppers, spacing, and row alignment feel inconsistent across sections.
   - Each section appears to invent its own layout rules.

2. **Weak alignment**
   - Inputs do not consistently line up into readable columns or rows.
   - Related controls often feel visually disconnected.

3. **Too much vertical sprawl**
   - Repeating content sections consume too much height.
   - Important repeated-entry areas behave like large standalone forms instead of compact editors.

4. **Poor component reuse**
   - Similar sections do not clearly share the same underlying UI patterns.
   - Add-row behavior, row spacing, and field presentation should feel related across the app.

5. **Preview/editor balance**
   - The preview is useful, but the editor must remain the primary workspace.
   - Layout decisions should prioritize authoring efficiency first.

---

## UX Principles

### 1. Power-user density
The editor should be compact and information-dense, but never chaotic. Dense is good. Messy is bad.

### 2. Consistency beats cleverness
Prefer a small number of reusable field and layout patterns over many custom one-off solutions.

### 3. Repeating data should feel like repeating data
Rows such as classes, defenses, skills, actions, bonus actions, reactions, and special entries should use a shared repeatable-row/list pattern.

### 4. Editing first, preview second
The live preview is valuable, but should not force awkward editor layouts.

### 5. Structural polish before visual polish
Fix spacing, alignment, field rules, and component reuse before doing cosmetic styling passes.

### 6. Direct typing first
For desktop data entry, controls should prioritize fast typing and clean alignment over decorative control complexity.

---

## Editor Layout Direction

### Overall page
- Keep a two-pane desktop layout:
  - main editor on the left
  - persistent live preview on the right
- The preview should remain useful but visually secondary to the editor workspace.
- Favor a sticky preview if that behavior already exists or can be added safely.

### Section design
- Each major section should feel like part of the same system.
- Use consistent section padding, header treatment, internal spacing, and row rhythm.
- Support collapse/expand behavior where useful, especially for repeated content.

---

## Shared Component Direction

Build or refactor toward reusable components/patterns for:

- section containers
- field labels
- text inputs
- numeric inputs
- select inputs
- stepper-style numeric controls
- inline field rows
- repeatable row editors
- action/ability editors
- compact add/remove controls
- preview panel containers

Even if implemented inside a single file for now, the UI should still follow a reusable component mindset.

---

## Field and Spacing Rules

### Labels
- Use one consistent label style throughout the editor.
- Labels should have consistent case treatment, size, weight, and spacing above controls.

### Inputs
- Use consistent heights for comparable controls.
- Comparable fields should visually align across columns and rows.
- Standard text/select widths around `30ch` are acceptable for medium string-entry controls, but widths should be intentional and consistent.

### Numeric Input Guidance
Numeric fields should favor fast desktop entry and clear alignment.
- For small numeric values, integrated - value + controls are acceptable when they genuinely improve speed.
- Avoid browser-native spinner arrows when they create visual inconsistency or poor centering.

Guidelines:
- Do not use oversized text boxes for small numeric values.
- Stepper controls are acceptable only where they feel genuinely efficient.
- Prefer compact numeric input patterns that support direct typing first.
- If +/- controls are present, they should feel visually integrated with the field rather than bolted on as tiny side attachments.
- Comparable numeric fields should share the same structure throughout the editor.

### Spacing
- Use a small spacing scale and apply it consistently.
- Avoid arbitrary per-section spacing tweaks unless solving a real structural issue.

### Buttons
- Add-row controls across the app should share one visual style.
- Remove controls should be clearly associated with the row/item they affect.
- Primary, secondary, and utility actions should feel visually distinct.

---

## Repeating Section Rules

Repeated-entry sections should follow a shared interaction model where possible.

These include:
- class rows
- damage rows
- condition rows
- skill rows
- action rows
- bonus action rows
- reaction rows
- special rows

Guidelines:
- Prefer compact row/card presentation over large vertically expanded forms.
- Expanded editing is acceptable, but the collapsed/default state should remain space-efficient.
- Add/remove behavior should be obvious and consistent.
- Row controls should clearly target the row they belong to.

---

### Shared row-editor pattern
Where repeated structured data is simple and highly scannable, prefer a compact row-editor or matrix-style layout over nested boxed mini-forms.

Guidelines:
- use intentional column widths based on expected content
- place row remove actions in a dedicated far-right action slot
- avoid nested containers around each row unless necessary
- optional subtle odd/even row striping is acceptable when it improves scanability
- repeated rows should feel like part of one list or matrix, not isolated mini-cards

## Section-Specific Guidance

### Identity
- Preserve the current data captured here.
- Improve spacing and alignment between `Name`, class entry rows, and `Size / Race / Type`.
- `Name` should feel appropriately important.
- Class rows should feel like clean repeatable entries, not loosely grouped controls.
- Remove action should clearly apply to the full class row.
- Keep `+ Add Class` visually tied to the class list, with enough gap before the next field group.
- Class level entries may use the same compact row-editor pattern as other repeated structured sections.

### Combat Stats
- `AC`, `HP`, and `Speed` should remain visually centered and treated as parallel fields.
- Maintain support for sheet-mapped additional speed fields:
  - `Climb Speed`
  - `Swim Speed`
  - `Fly Speed`
- `Speed Variant 1` and `Speed Variant 2` should appear on separate lines if retained as explicit UI rows.
- If refactoring layout, preserve data mapping behavior exactly.

### Defenses
- `Type`, `Effect`, and `Roll Mod` should be grouped with intentional spacing.
- Remove dead horizontal space between columns.
- Match the visual rhythm used in other inline repeatable rows.
- Keep conditions model as a single effect flag.
- Keep damage model split into effect + roll mod flags.

### Attributes
- All six attributes should feel like instances of the same component.
- Align score, modifier, save, and save flag consistently across each attribute card/block.
- Reduce unnecessary bulk while keeping readability.
- If attributes are displayed in a row-based matrix, prioritize fast editing of Score and Save, while treating Modifier as a derived secondary value.

### Skills & Senses
- Keep utility fields compact and aligned.
- Skill rows should feel like efficient repeatable entries rather than oversized form fragments.

### Actions / Bonus Actions / Reactions
- These sections should share the same editing pattern as much as possible.
- Preserve expand-on-demand behavior where it helps reduce vertical sprawl.
- Description editing can remain richer than simple text fields, but the collapsed/default state should stay compact.

### Spells
- Keep the current data model intact unless explicitly approved for refactor.
- Improve alignment and consistency of slot/spell rows.

### Special
- Keep the current functionality intact.
- Ensure controls like `Start On New Line` feel clearly attached to the row/content they affect.

---

## Implementation Constraints

- Prefer changes in `App.html` only unless another file is truly necessary.
- Preserve all existing save/read behavior.
- Preserve all sheet mappings.
- Preserve printed output behavior and layout.
- Do not silently rename or reinterpret data fields that are already wired to the sheet.

### TODO: Spreadsheet Dependency
- The app currently relies on sheet-structured row labels/mappings for persistence and output integrity.
- Plan to deprecate spreadsheet-coupled persistence only after the app proves stable/flawless in real authoring use.
- Until then, prioritize compatibility and correctness with current sheet mappings over data-model migration.

### Phase 1 expectation
Phase 1 should prioritize shared field styling, alignment, spacing, numeric input consistency, and repeated-row consistency before any deeper structural redesign.

---

## Definition of Success

The editor should feel like a single coherent tool rather than a collection of separate forms.

A successful pass will produce:

- cleaner alignment
- consistent field sizing and spacing
- shared row/component behavior
- reduced vertical waste
- clearer relationships between controls
- better scanability during data entry

If choosing between cosmetic flourish and structural consistency, choose structural consistency.

### Control sizing
Inputs should be sized to their expected content rather than stretched by default.
Short and medium-length fields should use intentional compact widths unless broader width is clearly useful.

### Derived values
Computed or derived values must be visually distinct from editable inputs and should not appear as standard form fields.
Derived values may remain visible for feedback, but should be visually secondary to authored inputs.
