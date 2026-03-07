function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Combat Tools")
    .addItem("View Stat Card", "openStatCardModal")
    .addItem("Show Print Selector", "showPrintSelector")
    .addToUi();
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var template = HtmlService.createTemplateFromFile('PrintCards');
  
  // e.parameter.sheets should be a comma-separated list of sheet names.
  var sheetNames = [];
  if (e.parameter.sheets) {
    sheetNames = e.parameter.sheets.split(',');
  } else {
    // If no parameter is provided, fall back to all printable sheets.
    sheetNames = getPrintableSheetNames();
  }
  
  var cardsData = [];
  sheetNames.forEach(function(name) {
    var sheet = ss.getSheetByName(name.trim());
    if (sheet) {
      cardsData.push(getCardDataFromSheet(sheet));
    }
  });
  
  template.cardsData = cardsData;
  return template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
}



function openStatCardModal() {
  const template = HtmlService.createTemplateFromFile('CombinedView');
  template.cardData = getCardData();

  const html = template.evaluate()
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setWidth(600)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Stat Card Preview');
}

function printStatCards() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // List your character sheet names here.
  var sheetNames = ["Iwo", "Lysara", "Enigma", "Arch Mage"];
  var cardsData = [];
  
  sheetNames.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (sheet) {
      cardsData.push(getCardDataFromSheet(sheet));
    }
  });
  
  // Use a new HTML template that will lay out multiple cards.
  var template = HtmlService.createTemplateFromFile('PrintCards');
  // Pass the array of card data objects to the template.
  template.cardsData = cardsData;
  
  var html = template.evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setWidth(850)   // Adjust dimensions as needed
      .setHeight(1100);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Print Stat Cards');
}

function showPrintLink() {
  const url = "https://script.google.com/macros/s/AKfycbwsbPSLY-vZ-f8jP6Jjg1U_HbqAcfYDzgt1Z_tkdiQk/dev"; // Use your deployed Web App URL
  const html = HtmlService.createHtmlOutput(`<p><a href="${url}" target="_blank">Click here to print cards</a></p>`);
  SpreadsheetApp.getUi().showModalDialog(html, "Open Print View");
}


function getPrintableSheetNames() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var printable = [];
  
  sheets.forEach(function(sheet) {
    // For example, check if cell A1 equals "Printable"
    // (Adjust the cell or condition as needed.)
    var cellValue = sheet.getRange("c2").getDisplayValue();
    if (cellValue.trim() !== "") {
      printable.push(sheet.getName());
    }
      });
  
  return printable;
}

function showPrintSelector() {
  var printableSheets = getPrintableSheetNames();
  var template = HtmlService.createTemplateFromFile('PrintSelector');
  template.printableSheets = printableSheets; // pass array into template
  var html = template.evaluate().setWidth(300).setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, "Select Sheets to Print");
}



function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function mapFlag(flag) {
  const map = {
    'Resistance': ' <b>Ⓡ</b>',
    'Vulnerability': ' <b>Ⓥ</b>',
    'Immunity': ' <b>ⓘ</b>',
    'Advantage': '▲',
    'Disadvantage': '▼'
  };
  return map[flag] || '';
}

function getCardData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getRange("B2:E" + sheet.getLastRow());
  const values = range.getDisplayValues();

  const specialFormatting = {
    'damage': ', ',
    'conditions': ', ',
    'skills': ' • ',
    'exp': ' • ',
    'other': ' • ',
    'actions': '<br>',
    'bonus_actions': '<br>',
    'reactions': '<br>',
    'special': '<br>'
  };

  const data = {};
  let currentSection = null;

  values.forEach(row => {
    const section = row[0];
    const value = row[1];
    const flag1 = row[2];
    const flag2 = row[3];

    if (section) {
      currentSection = section.toLowerCase().replace(/\s*\(.*?\)/g, '').replace(/\s+/g, '_');
      if (!data[currentSection]) {
        data[currentSection] = [];
      }
    }

    if (currentSection && value) {
      let combined = value;
      if (flag1) combined += mapFlag(flag1);
      if (flag2) combined += mapFlag(flag2);
      data[currentSection].push(combined);
    }

  });

  // Smart join based on map
  for (const key in data) {
    const separator = specialFormatting[key] || '<br>';
    data[key] = data[key].join(separator);
  }

  // Build skills LAST
  data.skills = buildSkillsData(sheet);

  data.back = buildBackCardData(sheet);
  data.spells = buildSpellsData(sheet);

  return data;
}


function getCardDataFromSheet(sheet) {
  const range = sheet.getRange("B2:E" + sheet.getLastRow());
  const values = range.getDisplayValues();

  const specialFormatting = {
    'damage': ', ',
    'conditions': ', ',
    'skills': ' • ',
    'exp': ' • ',
    'other': ' • ',
    'actions': '<br>',
    'bonus_actions': '<br>',
    'reactions': '<br>',
    'special': '<br>'
  };

  const data = {};
  let currentSection = null;

  values.forEach(row => {
    const section = row[0];
    const value = row[1];
    const flag1 = row[2];
    const flag2 = row[3];

    if (section) {
      currentSection = section.toLowerCase().replace(/\s*\(.*?\)/g, '').replace(/\s+/g, '_');
      if (!data[currentSection]) {
        data[currentSection] = [];
      }
    }

    if (currentSection && value) {
      let combined = value;
      if (flag1) combined += mapFlag(flag1);
      if (flag2) combined += mapFlag(flag2);
      data[currentSection].push(combined);
    }
  });

  // Smart join using the defined separators
  for (const key in data) {
    const separator = specialFormatting[key] || '<br>';
    data[key] = data[key].join(separator);
  }

  // Build additional sections using your helper functions
  data.skills = buildSkillsData(sheet);
  data.back = buildBackCardData(sheet);
  data.spells = buildSpellsData(sheet);

  return data;
}




function buildSkillsData(sheet) {
  // Grab rows from B2 to E(lastRow)
  const values = sheet.getRange("B2:E" + sheet.getLastRow()).getDisplayValues();

  // We'll store the special values individually.
  let proficiency = "";          // For "Proficiency Bonus"
  let initiative = "";           // For "Initiative"
  let passivePerception = "";    // For "Passive Perception"
  let vision = "";               // For "Vision"
  let skillsArr = [];            // For all individual skills

  // Abbreviations for skill names.
  const abbreviations = {
    "Acrobatics": "Acr", "Animal Handling": "Ani", "Arcana": "Arc",
    "Athletics": "Ath", "Deception": "Dec", "History": "His",
    "Insight": "Ins", "Intimidation": "Inti", "Investigation": "Inv",
    "Medicine": "Med", "Nature": "Nat", "Perception": "Perc",
    "Performance": "Perf", "Persuasion": "Pers", "Religion": "Rel",
    "Sleight of Hand": "Sle", "Stealth": "Ste", "Survival": "Sur"
  };

  // Map advantage/disadvantage flags to triangle symbols.
  const mapFlagForSkill = flag => {
    const m = {
      "Advantage": "▲",    // up triangle
      "Disadvantage": "▼"  // down triangle
    };
    return m[flag] || "";
  };

  // Process each row from the sheet
  values.forEach(row => {
    // Columns:
    // row[0] -> Category (e.g. "Proficiency Bonus", "Initiative", "Passive Perception", "Vision", or "Skills")
    // row[1] -> Value or Skill name
    // row[2] -> Modifier (for skills; this already includes the plus/minus if typed that way)
    // row[3] -> Advantage/disadvantage flag (to be mapped to a triangle)
    const categoryRaw = row[0] ? row[0].trim() : "";
    const valueRaw = row[1] ? row[1].trim() : "";
    const modifier = row[2] ? row[2].trim() : "";
    const flag = row[3] ? row[3].trim() : "";

    if (!categoryRaw || !valueRaw) return; // Skip blank rows

    // Convert category to lowercase for easier matching.
    const category = categoryRaw.toLowerCase();

    // Check for special rows and store their values individually.
    if (category === "proficiency bonus") {
      proficiency = valueRaw;
    } else if (category === "initiative") {
      initiative = valueRaw;
    } else if (category === "passive perception") {
      passivePerception = valueRaw;
    } else if (category === "vision") {
      vision = valueRaw;
    }
    // Otherwise, if it's a skill row...
    else if (category === "skills" || category.includes("skill")) {
      // Abbreviate the skill name (default to valueRaw if not in abbreviations)
      const abbr = abbreviations[valueRaw] || valueRaw;
      // If a modifier exists, add a space before it.
      const modText = modifier ? ` ${modifier}` : "";
      // Append the triangle flag immediately after the modifier (if any)
      const flagText = flag ? mapFlagForSkill(flag) : "";
      // Push the formatted skill into our skills array.
      skillsArr.push(`${abbr}${modText}${flagText}`);
    }
  });

  // Return an object with individual special values plus a unified skills string.
  return {
    proficiency: proficiency,
    initiative: initiative,
    passive_perception: passivePerception,
    vision: vision,
    skills: skillsArr.join(", ")
  };
}





function buildBackCardData(sheet) {
  // 1) Read rows B2:E
  const values = sheet.getRange("B2:E" + sheet.getLastRow()).getDisplayValues();

  // 2) Arrays for each category
  let actionsArr = [];
  let bonusArr   = [];
  let reactArr   = [];
  let specialArr = [];

  values.forEach(row => {
    // Column indices (0-based):
    //   Column B: row[0] : Category (e.g. "Special", "Action", etc.)
    //   For non-special rows:
    //       Column C: row[1] : costOrExtra (e.g. "[1 Ki]") 
    //       Column D: row[2] : name (e.g. "Quarterstaff")
    //       Column E: row[3] : descHTML (e.g. "+9 <i>(1d8+5)</i> Topple...")
    //
    //   For Special rows:
    //       Column C: row[1] : the special text (which may have HTML)
    //       Column D: row[2] : checkbox ("TRUE" for a new line, "FALSE" to append)
    
    const categoryRaw = row[0] ? row[0].trim() : "";
    if (!categoryRaw) return; // skip if no category

    const cat = categoryRaw.toLowerCase();

    if (cat === "special") {
      // For Special, we ignore the usual "name" requirement.
      // Get special text from Column C (row[1]) and checkbox from Column D (row[2])
      let specialText = row[1] ? row[1].trim() : "";
      let checkboxStr = row[2] ? row[2].trim() : "";
      if (!specialText) return; // nothing to add

      let newLineFlag = (checkboxStr.toUpperCase() === "TRUE");

      if (newLineFlag) {
        // Start a new special line
        specialArr.push(specialText);
      } else {
        // Append to previous line using the dot separator.
        if (specialArr.length === 0) {
          specialArr.push(specialText);
        } else {
          specialArr[specialArr.length - 1] += " • " + specialText;
        }
      }
    } else {
      // For all other categories (action, bonus action, reaction)
      // We require that the "name" (Column D, row[2]) is non-empty.
      const costOrExtra = row[1] ? row[1].trim() : "";  
      const name        = row[2] ? row[2].trim() : "";  
      const descHTML    = row[3] ? row[3].trim() : "";  

      if (!name) return; // skip rows without a name

      // Build the line (apply bold and colon to the "name")
      let lineHTML = "";
      if (costOrExtra) {
        lineHTML += costOrExtra + " ";
      }
      lineHTML += `<strong>${name}:</strong>`;
      if (descHTML) {
        lineHTML += " " + descHTML;
      }

      // Place the line in the right category array.
      if (cat === "action" || cat === "actions") {
        actionsArr.push(lineHTML);
      } else if (cat === "bonus action" || cat === "bonus actions") {
        bonusArr.push(lineHTML);
      } else if (cat === "reaction" || cat === "reactions") {
        reactArr.push(lineHTML);
      }
    }
  });

  // 3) Convert arrays to a single string joined by <br>
  const actionsStr = actionsArr.join("<br>");
  const bonusStr   = bonusArr.join("<br>");
  const reactStr   = reactArr.join("<br>");
  const specialStr = specialArr.join("<br>");

  // 4) Return an object for your template
  return {
    actions: actionsStr,
    bonus_actions: bonusStr,
    reactions: reactStr,
    special: specialStr
  };
}




function buildSpellsData(sheet) {
  // 1) Grab raw data
  const values = sheet.getDataRange().getDisplayValues();
  
  let spellsData = {
    cantrips: "",
    levelSlots: new Array(9).fill("0"),  // levels 1-9
    levelSpells: new Array(9).fill("")
  };
  
  // Regex to detect rows like "1st Level Spell Slots" and "1st Level Spells"
  const slotRegex   = /^(\d+)(?:st|nd|rd|th)\s+level\s+spell\s+slots$/i;
  const spellsRegex = /^(\d+)(?:st|nd|rd|th)\s+level\s+spells$/i;
  
  // Read each row (assuming col B has category, col C has value)
  values.forEach(row => {
    let cat = row[1] ? row[1].trim().toLowerCase() : "";
    let val = row[2] ? row[2].trim() : "";
    if (!cat) return;
    
    if (cat === "cantrips") {
      spellsData.cantrips = val;
    } else {
      let match;
      if ((match = cat.match(slotRegex))) {
        let lvl = parseInt(match[1], 10);
        if (lvl >= 1 && lvl <= 9) {
          spellsData.levelSlots[lvl - 1] = val || "0";
        }
      } else if ((match = cat.match(spellsRegex))) {
        let lvl = parseInt(match[1], 10);
        if (lvl >= 1 && lvl <= 9) {
          spellsData.levelSpells[lvl - 1] = val;
        }
      }
    }
  });
  
  // 2) Helper to italicize each comma-separated spell
  function italicizeSpellList(str) {
    if (!str) return "";
    let arr = str.split(",");
    return arr.map(sp => `<i>${sp.trim()}</i>`).join(", ");
  }
  
  // Italicize cantrips and each level's spells
  spellsData.cantrips = italicizeSpellList(spellsData.cantrips);
  for (let i = 0; i < 9; i++) {
    spellsData.levelSpells[i] = italicizeSpellList(spellsData.levelSpells[i]);
  }
  
  // 3) Build the bracketed slot groups, ignoring "Slots:"
  // Groups: levels 1-3, 4-6, 7-9
  let groups = [
    spellsData.levelSlots.slice(0,3),
    spellsData.levelSlots.slice(3,6),
    spellsData.levelSlots.slice(6,9)
  ];
  
  // Find highest level that actually has spells
  let highestLevel = 0;
  for (let i = 0; i < 9; i++) {
    if (spellsData.levelSpells[i]) highestLevel = i + 1;
  }
  
  // At least show group 1 if no spells
  let groupsToShow = Math.ceil(Math.max(highestLevel, 1) / 3);
  
  // E.g. ["[4/3/3]", "[1/0/0]"]
  let bracketedGroups = [];
  for (let g = 0; g < groupsToShow; g++) {
    bracketedGroups.push("[" + groups[g].join("/") + "]");
  }
  // This is what we'll display in the block-title line next to "Spells"
  let spellsTitle = bracketedGroups.join(" ");
  
  // 4) Build the rest of the spells (cantrips + levels)
  let lines = [];
  
  // [C] for cantrips if any
  if (spellsData.cantrips) {
    lines.push(`<strong>[C]</strong> ${spellsData.cantrips}`);
  }
  
  // Group the actual spells in sets of 3 levels
  for (let g = 0; g < 3; g++) {
    let groupLabels = [];
    for (let offset = 0; offset < 3; offset++) {
      let levelIndex = g * 3 + offset;
      if (spellsData.levelSpells[levelIndex]) {
        groupLabels.push(`<strong>[${levelIndex + 1}]</strong> ${spellsData.levelSpells[levelIndex]}`);
      }
    }
    // If this group has any spells, they go on one line
    if (groupLabels.length) {
      lines.push(groupLabels.join(" "));
    }
  }
  
  // Combine all lines with <br>
  let spellsString = lines.join("<br>");
  
  // If everything is empty, we can return blank
  let isEmpty = (!spellsTitle && !spellsString);
  if (isEmpty) {
    return { spellsTitle: "", spellsString: "" };
  }
  
  return {
    spellsTitle: spellsTitle,  // e.g. "[4/3/3] [1/0/0]"
    spellsString: spellsString // e.g. "[C] <i>fire bolt</i>, <i>light</i>... [1] <i>detect magic</i>..."
  };
}




