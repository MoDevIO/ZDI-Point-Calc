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
const mockClasses = new Set();
const mockCard = {
  classList: {
    remove: (...args) => args.forEach(a => mockClasses.delete(a)),
    add: (...args) => args.forEach(a => mockClasses.add(a))
  }
};
const document = {
  getElementById: (id) => {
    if (id.startsWith('card-')) return mockCard;
    return { innerText: '', style: {} };
  }
};

let previousScores = { total: 0, tasks: 0, bonus: 0, penalty: 0 };
function animateNumber() {}

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

// simulate interaction
state.interacted["task_1"] = true;
state.checkboxes["1A_ROCKET"] = true;
updateCardColors();
console.log("Mock classes for task 1:", Array.from(mockClasses));

state.checkboxes["1A_BASE"] = true;
state.checkboxes["1A_STACK"] = true;
state.checkboxes["1B_FUEL_1"] = true;
state.checkboxes["1B_FUEL_2"] = true;
state.checkboxes["1C_LEVER"] = true;
updateCardColors();
console.log("Mock classes for task 1 (all true):", Array.from(mockClasses));

state.checkboxes["1A_ROCKET"] = false;
state.checkboxes["1A_BASE"] = false;
state.checkboxes["1A_STACK"] = false;
state.checkboxes["1B_FUEL_1"] = false;
state.checkboxes["1B_FUEL_2"] = false;
state.checkboxes["1C_LEVER"] = false;
updateCardColors();
console.log("Mock classes for task 1 (all false):", Array.from(mockClasses));
