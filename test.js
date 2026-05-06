const tasks = [
      {
        id: "task_1",
        title: "Aufgabe 1: Rakete & Startrampe",
        items: [
          { id: "1A_ROCKET", type: "checkbox", label: "1A Rakete vollständig/aufrecht im roten Bereich", points: 15 },
          { id: "1A_BASE", type: "checkbox", label: "1A Unterbau vollständig/aufrecht im roten Bereich", points: 15 },
          { id: "1A_STACK", type: "checkbox", label: "1A Rakete auf Unterbau, beides vollständig im roten Bereich", points: 10 },
          { id: "1B_FUEL_1", type: "checkbox", label: "1B Treibstoffelement 1 vollständig im roten Bereich", points: 11 },
          { id: "1B_FUEL_2", type: "checkbox", label: "1B Treibstoffelement 2 vollständig im roten Bereich", points: 11 },
          { id: "1C_LEVER", type: "checkbox", label: "1C Roter Hebel herausgezogen, rote Markierung berührt", points: 17 },
        ]
      },
      {
        id: "task_2",
        title: "Aufgabe 2: Sternwarte & Erdantenne",
        items: [
          { id: "2A_BUS", type: "checkbox", label: "2A Schulbus", points: 18 },
          {
            id: "2B_ANTENNA",
            type: "radio",
            label: "2B Erdantenne",
            options: [
              { value: "RED", label: "Rot", points: 22 },
              { value: "YELLOW", label: "Gelb", points: 17 },
              { value: "GREEN", label: "Grün", points: 17 },
              { value: "NONE", label: "Keine Wertung", points: 0 }
            ]
          }
        ]
      },
      {
        id: "task_3",
        title: "Aufgabe 3: Satelliten & Weltallantenne",
        items: [
          { id: "3A_SAT_1", type: "checkbox", label: "3A Satellit 1", points: 13 },
          { id: "3A_SAT_2", type: "checkbox", label: "3A Satellit 2", points: 13 },
          {
            id: "3B_ANTENNA",
            type: "radio",
            label: "3B Weltallantenne",
            options: [
              { value: "RED", label: "Rot", points: 22 },
              { value: "YELLOW", label: "Gelb", points: 17 },
              { value: "GREEN", label: "Grün", points: 17 },
              { value: "NONE", label: "Keine Wertung", points: 0 }
            ]
          }
        ]
      },
      {
        id: "penalties",
        title: "Abzüge",
        items: [
          { id: "PENALTY_TOUCH", type: "number", label: "Berührungen (-10 pro Touch)", step: 1, min: 0 },
          { id: "PENALTY_FAIR", type: "checkbox", label: "Verstoß gegen Fairnessgebot", points: -100 },
        ]
      }
];

const initialState = {
  checkboxes: {
    "12_BARRIER_BASE": true,
    "12_BARRIER_A": true,
    "12_BARRIER_B": true
  },
  radios: {
    "2B_ANTENNA": "NONE",
    "3B_ANTENNA": "NONE",
    "4_DEBRIS_BLUE": "NONE",
    "5_SPACE": "NONE"
  },
  numbers: {
    "PENALTY_TOUCH": 0
  },
  interacted: {}
};

let state = JSON.parse(JSON.stringify(initialState));

// Mock DOM
const mockCards = {};
function getMockCard(taskId) {
  if (!mockCards[taskId]) {
    const classes = new Set();
    mockCards[taskId] = {
      classes,
      classList: {
        remove: (...args) => args.forEach(a => classes.delete(a)),
        add: (...args) => args.forEach(a => classes.add(a))
      }
    };
  }
  return mockCards[taskId];
}
const mockElements = {};
const document = {
  getElementById: (id) => {
    if (id.startsWith('card-')) return getMockCard(id.slice(5));
    if (!mockElements[id]) mockElements[id] = { innerText: '', style: {} };
    return mockElements[id];
  }
};

let previousScores = { total: 0, tasks: 0, bonus: 0, penalty: 0 };
function animateNumber(id, start, end) {
  const el = document.getElementById(id);
  if (el) el.innerText = String(end);
}

function updateCardColors() {
      tasks.forEach(task => {
        const card = document.getElementById(`card-${task.id}`);
        if (!card) return;

        card.classList.remove("status-red", "status-yellow", "status-green");

        if (!state.interacted[task.id]) {
          return;
        }

        if (task.id === "penalties") {
          const penaltyPts = (state.numbers["PENALTY_TOUCH"] || 0) * 10 + (state.checkboxes["PENALTY_FAIR"] ? 100 : 0);
          if (penaltyPts > 0) {
            card.classList.add("status-red");
          } else {
            card.classList.add("status-green");
          }
          return;
        }

        let maxPoints = 0;
        let currentPoints = 0;

        task.items.forEach(item => {
          if (item.type === "checkbox") {
            maxPoints += item.points;
            if (state.checkboxes[item.id]) {
              currentPoints += item.points;
            }
          } else if (item.type === "radio") {
            let maxRadio = 0;
            item.options.forEach(opt => {
              if (opt.points > maxRadio) maxRadio = opt.points;
            });
            maxPoints += maxRadio;

            const selectedValue = state.radios[item.id];
            const option = item.options.find(o => o.value === selectedValue);
            if (option) {
              currentPoints += option.points;
            }
          }
        });

        if (currentPoints === 0) {
          card.classList.add("status-red");
        } else if (currentPoints === maxPoints) {
          card.classList.add("status-green");
        } else {
          card.classList.add("status-yellow");
        }
      });
}

function calculatePoints() {
  let taskP = 0;
  let penalty = state.checkboxes["PENALTY_FAIR"] ? 100 : 0;
  let touchPen = state.numbers["PENALTY_TOUCH"] * 10;
  const ant2 = state.radios["2B_ANTENNA"];
  const ant3 = state.radios["3B_ANTENNA"];
  let bonus = (ant2 !== "NONE" && ant2 === ant3) ? 15 : 0;

  tasks.forEach(task => {
    task.items.forEach(item => {
      if (item.type === "checkbox" && state.checkboxes[item.id] && item.id !== "PENALTY_FAIR") {
        taskP += item.points;
      } else if (item.type === "radio") {
        const selectedValue = state.radios[item.id];
        const option = item.options && item.options.find(o => o.value === selectedValue);
        if (option) {
          taskP += option.points;
        }
      }
    });
  });

  const totalPenalty = touchPen + penalty;
  const total = taskP + bonus - totalPenalty;

  animateNumber("scoreTotal", previousScores.total, total);
  animateNumber("scoreTasks", previousScores.tasks, taskP);
  document.getElementById("scoreBonus").innerText = bonus;
  animateNumber("scorePenalty", previousScores.penalty, totalPenalty);

  previousScores = { total, tasks: taskP, bonus, penalty: totalPenalty };
  return { total, taskP, bonus, totalPenalty };
}

// ── Tests ────────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`  ✓ ${description}`);
    passed++;
  } else {
    console.error(`  ✗ ${description}`);
    failed++;
  }
}

function resetState() {
  state = JSON.parse(JSON.stringify(initialState));
  previousScores = { total: 0, tasks: 0, bonus: 0, penalty: 0 };
  Object.keys(mockElements).forEach(k => delete mockElements[k]);
  Object.keys(mockCards).forEach(k => delete mockCards[k]);
}

console.log("\n=== Test: Aufgabe 1 – Karten-Farben ===");
resetState();
state.interacted["task_1"] = true;
state.checkboxes["1A_ROCKET"] = true;
updateCardColors();
assert("Teilpunkte → status-yellow", mockCards["task_1"].classes.has("status-yellow") && !mockCards["task_1"].classes.has("status-green"));

state.checkboxes["1A_BASE"] = true;
state.checkboxes["1A_STACK"] = true;
state.checkboxes["1B_FUEL_1"] = true;
state.checkboxes["1B_FUEL_2"] = true;
state.checkboxes["1C_LEVER"] = true;
updateCardColors();
assert("Alle Punkte → status-green", mockCards["task_1"].classes.has("status-green") && !mockCards["task_1"].classes.has("status-yellow"));

state.checkboxes["1A_ROCKET"] = false;
state.checkboxes["1A_BASE"] = false;
state.checkboxes["1A_STACK"] = false;
state.checkboxes["1B_FUEL_1"] = false;
state.checkboxes["1B_FUEL_2"] = false;
state.checkboxes["1C_LEVER"] = false;
updateCardColors();
assert("Keine Punkte → status-red", mockCards["task_1"].classes.has("status-red") && !mockCards["task_1"].classes.has("status-green"));

console.log("\n=== Test: Bonus – gleiche Farbe beide Antennen ===");
resetState();

state.radios["2B_ANTENNA"] = "RED";
state.radios["3B_ANTENNA"] = "RED";
let r = calculatePoints();
assert("Bonus +15 wenn beide ROT", r.bonus === 15);

resetState();
state.radios["2B_ANTENNA"] = "YELLOW";
state.radios["3B_ANTENNA"] = "YELLOW";
r = calculatePoints();
assert("Bonus +15 wenn beide GELB", r.bonus === 15);

resetState();
state.radios["2B_ANTENNA"] = "GREEN";
state.radios["3B_ANTENNA"] = "GREEN";
r = calculatePoints();
assert("Bonus +15 wenn beide GRÜN", r.bonus === 15);

resetState();
state.radios["2B_ANTENNA"] = "RED";
state.radios["3B_ANTENNA"] = "YELLOW";
r = calculatePoints();
assert("Kein Bonus wenn Farben verschieden (ROT/GELB)", r.bonus === 0);

resetState();
state.radios["2B_ANTENNA"] = "GREEN";
state.radios["3B_ANTENNA"] = "RED";
r = calculatePoints();
assert("Kein Bonus wenn Farben verschieden (GRÜN/ROT)", r.bonus === 0);

resetState();
state.radios["2B_ANTENNA"] = "NONE";
state.radios["3B_ANTENNA"] = "NONE";
r = calculatePoints();
assert("Kein Bonus wenn beide NONE", r.bonus === 0);

resetState();
state.radios["2B_ANTENNA"] = "NONE";
state.radios["3B_ANTENNA"] = "RED";
r = calculatePoints();
assert("Kein Bonus wenn eine Antenne NONE", r.bonus === 0);

console.log("\n=== Test: Abzug-Anzeige ===");
resetState();
state.numbers["PENALTY_TOUCH"] = 2;
r = calculatePoints();
assert("Abzug 20 bei 2 Berührungen", r.totalPenalty === 20);
assert("scoreBonus Element wird gesetzt (kein Null-Fehler)", mockElements["scoreBonus"] !== undefined);
assert("scorePenalty Element wird gesetzt", mockElements["scorePenalty"] !== undefined);

resetState();
state.numbers["PENALTY_TOUCH"] = 3;
state.checkboxes["PENALTY_FAIR"] = true;
r = calculatePoints();
assert("Abzug 130 bei 3 Touches + Fairnessverstoß", r.totalPenalty === 130);

console.log("\n=== Test: Gesamtpunktzahl ===");
resetState();
state.checkboxes["1A_ROCKET"] = true; // +15
state.radios["2B_ANTENNA"] = "RED";
state.radios["3B_ANTENNA"] = "RED";  // +22 each + 15 bonus
state.numbers["PENALTY_TOUCH"] = 1;  // -10
r = calculatePoints();
assert("Gesamtpunktzahl korrekt (15 + 22 + 22 + 15 - 10 = 64)", r.total === 64);

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} Tests: ${passed} bestanden, ${failed} fehlgeschlagen`);
if (failed > 0) process.exit(1);
