// ======= CONFIG =======
const USE_MOCK_DATA = true;
const API_URL = "YOUR_APPS_SCRIPT_ENDPOINT";

// Mock data for dev
const mockData = {
  "Date": [
    { date: "2025-05-01", value: "2025-05-01" },
    { date: "2025-05-02", value: "2025-05-02" }
  ],
  "Day": [
    { date: "2025-05-01", value: "Monday" },
    { date: "2025-05-02", value: "Tuesday" }
  ],
  "Time Awake": [
    { date: "2025-05-01", value: "7:03 AM" },
    { date: "2025-05-02", value: "7:00 AM" }
  ],
  "Coffee": [
    { date: "2025-05-01", value: "Yes" },
    { date: "2025-05-02", value: "No" }
  ],
  "Breakfast": [
    { date: "2025-05-01", value: "No" },
    { date: "2025-05-02", value: "Yes" }
  ],
  "Time at Work": [
    { date: "2025-05-01", value: "8:00 AM" },
    { date: "2025-05-02", value: "8:15 AM" }
  ],
  "Time Left Work": [
    { date: "2025-05-01", value: "5:00 PM" },
    { date: "2025-05-02", value: "4:45 PM" }
  ],
  "Did I watch Netflix in Bed last Night?": [
    { date: "2025-05-01", value: "Yes" },
    { date: "2025-05-02", value: "No" }
  ],
  "Did I use my phone for Social Media 30 mins after waking up?": [
    { date: "2025-05-01", value: "No" },
    { date: "2025-05-02", value: "Yes" }
  ],
  "# of Dabs": [
    { date: "2025-05-01", value: 1 },
    { date: "2025-05-02", value: 0 }
  ],
  "# of Bottles of Water Drank?": [
    { date: "2025-05-01", value: 5 },
    { date: "2025-05-02", value: 6 }
  ],
  "Number of Pages Read": [
    { date: "2025-05-01", value: 20 },
    { date: "2025-05-02", value: 15 }
  ],
  "Brush Teeth at Night": [
    { date: "2025-05-01", value: "Yes" },
    { date: "2025-05-02", value: "Yes" }
  ],
  "Wash Face at Night": [
    { date: "2025-05-01", value: "No" },
    { date: "2025-05-02", value: "Yes" }
  ],
  "Green Tea": [
    { date: "2025-05-01", value: "Yes" },
    { date: "2025-05-02", value: "No" }
  ],
  "Drink": [
    { date: "2025-05-01", value: "No" },
    { date: "2025-05-02", value: "No" }
  ],
  "Smoke": [
    { date: "2025-05-01", value: "No" },
    { date: "2025-05-02", value: "Yes" }
  ],
  "Soda": [
    { date: "2025-05-01", value: "No" },
    { date: "2025-05-02", value: "Yes" }
  ],
  "Chocolate": [
    { date: "2025-05-01", value: "Yes" },
    { date: "2025-05-02", value: "No" }
  ],
  "Workout": [
    { date: "2025-05-01", value: 1 },
    { date: "2025-05-02", value: 0 }
  ],
  "Relax?": [
    { date: "2025-05-01", value: "Yes" },
    { date: "2025-05-02", value: "Yes" }
  ],
  "How was my Day?": [
    { date: "2025-05-01", value: "Great" },
    { date: "2025-05-02", value: "Okay" }
  ],
  "Weight in lbs": [
    { date: "2025-05-01", value: 168.2 },
    { date: "2025-05-02", value: 167.8 }
  ],
  "# of Calories": [
    { date: "2025-05-01", value: 2200 },
    { date: "2025-05-02", value: 2000 }
  ],
  "Latest Hype?": [
    { date: "2025-05-01", value: "New Album" },
    { date: "2025-05-02", value: "Podcast" }
  ],
  "Dream I Had last night": [
    { date: "2025-05-01", value: "Flying" },
    { date: "2025-05-02", value: "Lost" }
  ],
  "Bed Time": [
    { date: "2025-05-01", value: "10:30 PM" },
    { date: "2025-05-02", value: "11:00 PM" }
  ],
  "Morning walk": [
    { date: "2025-05-01", value: "Yes" },
    { date: "2025-05-02", value: "No" }
  ]
};

// ======= CORE =======
async function loadData() {
  if (USE_MOCK_DATA) return mockData;
  const res = await fetch(API_URL);
  return await res.json();
}

let allHabits = [];
let allData = {};

function getHabitsFromMockData(data) {
  return Object.keys(data).filter(habit => habit !== "Date");
}

function getHabitData(data, habit) {
  return data[habit] || [];
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

function renderDashboard(selectedHabit) {
  const habit = selectedHabit || allHabits[0];
  renderSidebar(allHabits, habit);
  document.getElementById('chart-title').textContent = habit;
  const data = getHabitData(allData, habit);
  renderSummary(habit, data);
  renderHabitChart(habit, data);
}

document.addEventListener("DOMContentLoaded", async () => {
  allData = await loadData();
  allHabits = getHabitsFromMockData(allData);
  renderDashboard();
});

function renderSummary(habit, data) {
  const summaryDiv = document.getElementById('summary');
  if (!data.length) return summaryDiv.textContent = '';

  const sample = data[0].value;
  const isYesNo = v => /^(yes|no)$/i.test(v);
  const isNumber = v => typeof v === 'number' || !isNaN(Number(v));
  const isTime = v => /^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(v);

  if (isYesNo(sample)) {
    const yesCount = data.filter(d => d.value.toLowerCase() === 'yes').length;
    summaryDiv.textContent = `Total Yes: ${yesCount}`;
  } else if (isNumber(sample)) {
    const avg = (data.reduce((sum, d) => sum + Number(d.value), 0) / data.length).toFixed(2);
    summaryDiv.textContent = `Average: ${avg}`;
  } else if (isTime(sample)) {
    const toMinutes = v => {
      const [h, m, period] = v.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i).slice(1);
      let hour = parseInt(h, 10);
      const min = parseInt(m, 10);
      if (/PM/i.test(period) && hour !== 12) hour += 12;
      if (/AM/i.test(period) && hour === 12) hour = 0;
      return hour * 60 + min;
    };
    const avgMin = data.reduce((sum, d) => sum + toMinutes(d.value), 0) / data.length;
    const hour = Math.floor(avgMin / 60);
    const min = Math.round(avgMin % 60);
    summaryDiv.textContent = `Avg: ${hour}:${min.toString().padStart(2, '0')} (${avgMin.toFixed(0)} min)`;
  } else {
    summaryDiv.textContent = '';
  }
}