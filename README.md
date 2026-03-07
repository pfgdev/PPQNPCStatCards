# PPQ NPC Stat Cards

A Google Apps Script project that generates printable D&D 5e NPC stat cards
from a Google Spreadsheet. Each NPC lives on its own sheet tab; a "Combat Tools"
menu lets you preview or print cards directly from the spreadsheet.

---

## Architecture

```
Google Spreadsheet
  └── One tab per NPC (data in columns B–E)
        │
        ├── Combat Tools > View Stat Card
        │     └── openStatCardModal() → CombinedView.html
        │           ├── StatCard.html     (front face)
        │           └── StatCardBack.html (back face)
        │
        └── Combat Tools > Show Print Selector
              └── showPrintSelector() → PrintSelector.html
                    └── [user selects sheets] → opens Web App URL
                          └── doGet() → PrintCards.html
                                ├── StatCard.html     (front, per card)
                                └── StatCardBack.html (back, per card)
```

**Files:**

| File | Purpose |
|------|---------|
| `Code.js` | All server-side logic: menu, data parsing, web app entry point |
| `StatCard.html` | Card front face template (2.5" × 3.5") |
| `StatCardBack.html` | Card back face template — Combat Actions |
| `CombinedView.html` | Modal: front + back side by side for preview |
| `PrintCards.html` | Print page: grid of cards for browser printing |
| `PrintSelector.html` | Modal: checklist to pick which NPCs to print |

---

## Spreadsheet Layout

Each NPC tab uses columns **B–E**. Column A is unused. Columns G–H contain
decorative legend labels and are not read by the script.

### Column roles

| Column | Role |
|--------|------|
| B | Category label (drives which field the row populates) |
| C | Primary value (name, stat, spell list, etc.) |
| D | Secondary value (skill modifier, action name, damage flag) |
| E | Tertiary value (action description HTML, adv/disadv flag) |

### Category reference

| Category (col B) | C | D | E |
|-----------------|---|---|---|
| Name / Class / Size / Race | value | — | — |
| AC / HP / Speed / Climb Speed / Swim Speed / Fly Speed | value | — | — |
| Damage | damage type | Resistance / Vulnerability / Immunity | Advantage / Disadvantage |
| Conditions | condition name | Resistance / Vulnerability / Immunity | Advantage / Disadvantage |
| Strength / Dexterity / Constitution / Intelligence / Wisdom / Charisma | score | — | — |
| Strength Mod (etc.) | modifier (e.g. "+3") | — | — |
| Strength Save (etc.) | save bonus | Advantage / Disadvantage | — |
| Proficiency Bonus / Initiative | value | — | — |
| Passive Perception / Vision | value | — | — |
| Skills | skill name (e.g. "Arcana") | modifier (e.g. "+8") | Advantage / Disadvantage |
| Action / Bonus Action / Reaction | frequency/cost (e.g. "[1/day]") | ability name | description HTML |
| Cantrips | comma-separated spell names | — | — |
| 1st Level Spell Slots | number of slots | — | — |
| 1st Level Spells | comma-separated spell names | — | — |
| *(2nd–9th same pattern)* | | | |
| Special | full text (may include HTML tags) | TRUE = new line / FALSE = append | — |

### Printable sheet detection

A sheet is considered printable (shown in the Print Selector) if cell **C2**
is non-empty. C2 holds the NPC's Name value, so any sheet with a name filled
in will appear.

---

## Deployment

The print workflow requires a deployed web app. After making code changes:

1. In the Apps Script editor: **Deploy > Manage deployments**
2. For testing: use the **Dev** deployment (always runs the latest saved code)
3. For production: create or update a versioned deployment
4. Copy the web app URL and update it in **`PrintSelector.html`** (the `url`
   variable in the `printCards()` script block)

> **Note:** The web app URL is currently hardcoded in `PrintSelector.html`.
> This is a known limitation — see Known Issues below.

---

## Print Workflow

1. Open the Google Spreadsheet
2. **Combat Tools > Show Print Selector**
3. Check the NPCs you want to print, click **Print Cards**
4. A new browser tab opens with the print layout
5. Use the browser's print dialog (**Ctrl+P** / **Cmd+P**)
6. Recommended print settings:
   - Paper: Letter (8.5" × 11")
   - Margins: None (or minimum)
   - Scale: 100% (do not fit to page)
   - Background graphics: ON

---

## Known Issues

- **Print layout is hardcoded for 4 cards.** Cards beyond index 3 are silently
  dropped. The grid covers 3 fronts (row 1), 3 backs (row 2), and card 4
  front+back (row 3). This needs to be made dynamic.
- **Web app URL is hardcoded** in `PrintSelector.html`. Must be manually
  updated after each new deployment.
- **`printStatCards()`** and **`showPrintLink()`** in `Code.js` are dead code
  (not called from the menu). Marked `@deprecated`.
- **`getCardData()` and `getCardDataFromSheet()`** are nearly identical.
  `getCardData()` is a thin wrapper that could be simplified.
- **Print gaps:** The current browser-print approach can produce inconsistent
  spacing. This is a known issue being addressed in the next iteration of
  `PrintCards.html`.
