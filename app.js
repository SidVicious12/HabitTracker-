// --- CONFIG ---
// Use your real endpoint here
const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";

// For development/demo, use static mock data:
const mockData = [
  {
    "Date": "2025-05-01",
    "Time Awake": "7:03 AM",
    "Coffee": "Yes",
    "Workout": 1,
    "Weight in lbs": 168.2
  },
  {
    "Date": "2025-05-02",
    "Time Awake": "7:00 AM",
    "Coffee": "No",
    "Workout": 0,
    "Weight in lbs": 167.8
  }
  // ...more rows
];

// --- DATA LOADING ---
async function loadData() {
  // For production, uncomment and use fetch:
  // const res = await fetch(API_URL);
  // return await res.json();

  // For demo, return mockData
  return mockData;
}

// --- HABIT DASHBOARD LOGIC ---
let allHabits = [];
let allRows = [];

function getHabitsFromRows(rows) {
  if (!rows.length) return [];
  return Object.keys(rows[0]).filter(k => k !== "Date");
}

function getHabitData(rows, habit) {
  return rows.map(row => ({
    date: row["Date"],
    value: row[habit]
  })).filter(entry => entry.value !== undefined && entry.value !== "");
}

function renderSidebar(habits, selected) {
  const habitList = document.getElementById('habit-list');
  habitList.innerHTML = '';
  habits.forEach(habit => {
    const li = document.createElement('li');
    li.textContent = habit;
    if (habit === selected) li.classList.add('active');
    li.onclick = () => renderDashboard(habit);
    habitList.appendChild(li);
  });
}

async function renderDashboard(selectedHabit) {
  if (!allRows.length) allRows = await loadData();
  if (!allHabits.length) allHabits = getHabitsFromRows(allRows);

  const habit = selectedHabit || allHabits[0];
  renderSidebar(allHabits, habit);

  // Chart title
  document.getElementById('chart-title').textContent = habit;

  // Get data for chart
  const data = getHabitData(allRows, habit);
  renderHabitChart(habit, data);
}

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
});