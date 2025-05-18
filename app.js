// ======= CONFIG =======
const USE_MOCK_DATA = false;
const API_URL = "https://script.google.com/macros/library/d/1FwUAFl40lM_g2OGQTmKsry79JcdPU9qRxqsu_mtUImFLhf_90-QNUsy2/3"; // replace with your Web App URL

// Mock data for dev

// ======= CORE =======
async function main() {
  const data = await loadData();
  if (!data) {
    alert("Failed to load habit data. Please check your connection or API.");
    return;
  }
  allData = data;
  allHabits = getHabitsFromMockData(data);
  // ...rest of your logic
}
async function loadData() {
  if (USE_MOCK_DATA) {
    return mockData;
  } else {
    try {
      console.log("Loading data...");
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error("Failed to load data:", error);
      return null;
    }
  }
}
let allHabits = [];
let allData = {};

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("HABIT dashboard");
  const data = sheet.getDataRange().getValues();

  const headers = data[0];
  const rows = data.slice(1);

  const transformed = {};

  for (let i = 1; i < headers.length; i++) {
    const habit = headers[i];
    transformed[habit] = rows.map(row => ({
      date: row[0], // assumes column 0 is Date
      value: row[i]
    })).filter(entry => entry.value !== "");
  }

  return ContentService
    .createTextOutput(JSON.stringify(transformed))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}


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