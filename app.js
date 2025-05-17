// ======= CONFIG =======
// Switch between mock data and live endpoint:
const USE_MOCK_DATA = true;
const API_URL = "YOUR_APPS_SCRIPT_ENDPOINT";

// Mock data for dev
const mockData = [
  { "Date": "2025-05-01", "Time Awake": "7:03 AM", "Coffee": "Yes", "Workout": 1, "Weight in lbs": 168.2 },
  { "Date": "2025-05-02", "Time Awake": "7:00 AM", "Coffee": "No", "Workout": 0, "Weight in lbs": 167.8 },
  { "Date": "2025-05-03", "Time Awake": "6:55 AM", "Coffee": "Yes", "Workout": 1, "Weight in lbs": 167.5 }
];

// ======= DATA LOADING =======
async function loadData() {
  if (USE_MOCK_DATA) {
    return mockData;
  } else {
    const res = await fetch(API_URL);
    return await res.json();
  }
}

// ======= HABIT DASHBOARD LOGIC =======
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

function renderSummary(habit, data) {
  const summaryDiv = document.getElementById('summary');
  if (!data.length) {
    summaryDiv.textContent = '';
    return;
  }
  // Detect type
  const sample = data[0].value;
  const isYesNo = v => /^(yes|no)$/i.test(v);
  const isNumber = v => typeof v === 'number' || !isNaN(Number(v));
  const isTime = v => /^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(v);

  if (isYesNo(sample)) {
    const yesCount = data.filter(d => d.value.toLowerCase() === 'yes').length;
    summaryDiv.textContent = `Total Yes: ${yesCount}`;
  } else if (isNumber(sample)) {
    const avg = (
      data.reduce((sum, d) => sum + Number(d.value), 0) / data.length
    ).toFixed(2);
    summaryDiv.textContent = `Average: ${avg}`;
  } else if (isTime(sample)) {
    // Average time in minutes
    const toMinutes = v => {
      const [h, m, period] = v.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i).slice(1);
      let hour = parseInt(h, 10);
      const min = parseInt(m, 10);
      if (/PM/i.test(period) && hour !== 12) hour += 12;
      if (/AM/i.test(period) && hour === 12) hour = 0;
      return hour * 60 + min;
    };
    const avgMin = (
      data.reduce((sum, d) => sum + toMinutes(d.value), 0) / data.length
    );
    const hour = Math.floor(avgMin / 60);
    const min = Math.round(avgMin % 60);
    summaryDiv.textContent = `Avg: ${hour}:${min.toString().padStart(2, '0')} (${avgMin.toFixed(0)} min)`;
  } else {
    summaryDiv.textContent = '';
  }
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

  // Summary
  renderSummary(habit, data);

  // Chart
  renderHabitChart(habit, data);
}

// ======= INIT =======
document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
});