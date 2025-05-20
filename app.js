
// ======= CORE =======
// ======= CONFIG =======
const USE_MOCK_DATA = false;

const API_URL = "https://script.google.com/macros/s/AKfycbzlni5PmzcYtzeImvxfHdNjrb5N8c8jCq6dG_vLI8nlidoxLOq0sbpP-fCX6e5mX5kB/exec";
// Mock data for dev

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

function getHabitsFromMockData(data) {
  return Object.keys(data).filter(habit => habit !== "Date");
}

async function main() {
  const data = await loadData();
  if (!data) {
    alert("Failed to load habit data. Please check your connection or API.");
    return;
  }
  allData = data;
  allHabits = getHabitsFromMockData(data);
  renderSidebar(allHabits);
  renderDashboardCards();
}

function renderSidebar(habits, selected) {
  const habitList = document.getElementById('habit-list');
  habitList.innerHTML = '';
  habits.forEach(habit => {
    const li = document.createElement('li');
    li.textContent = habit;
    if (habit === selected) li.classList.add('active');
    li.onclick = () => highlightCard(habit);
    habitList.appendChild(li);
  });
}

function highlightCard(habit) {
  // Scroll to the card and highlight it
  const card = document.querySelector(`[data-habit="${habit}"]`);
  if (card) {
    card.classList.add('active-highlight');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => card.classList.remove('active-highlight'), 1000);
  }
}

function renderDashboardCards() {
  const grid = document.getElementById('card-grid');
  grid.innerHTML = '';
  allHabits.forEach((habit, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-habit', habit);

    // Title
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = habit;
    card.appendChild(title);

    // Summary
    const summary = document.createElement('div');
    summary.className = 'card-summary';
    summary.textContent = getHabitSummary(habit, allData[habit]);
    card.appendChild(summary);

    // Chart
    const chartContainer = document.createElement('div');
    chartContainer.className = 'card-chart-container';
    const canvas = document.createElement('canvas');
    canvas.id = `habitChart-${idx}`;
    canvas.width = 320;
    canvas.height = 90;
    chartContainer.appendChild(canvas);
    card.appendChild(chartContainer);

    // Range toggle (static)
    const rangeToggle = document.createElement('div');
    rangeToggle.className = 'card-range-toggle';
    const btnMonthly = document.createElement('button');
    btnMonthly.textContent = 'Monthly';
    btnMonthly.className = 'active';
    btnMonthly.disabled = true;
    const btnWeekly = document.createElement('button');
    btnWeekly.textContent = 'Weekly';
    btnWeekly.disabled = true;
    rangeToggle.appendChild(btnMonthly);
    rangeToggle.appendChild(btnWeekly);
    card.appendChild(rangeToggle);

    grid.appendChild(card);

    // Animate in (staggered)
    setTimeout(() => {
      card.style.opacity = 1;
      card.style.transform = 'none';
    }, 100 + idx * 120);

    // Render mini chart
    renderMiniHabitChart(habit, allData[habit], canvas.id);
  });
}

function getHabitSummary(habit, data) {
  if (!data || data.length === 0) return "No data";
  // Try to infer type
  const sample = data[0].value;
  if (!isNaN(Number(sample))) {
    // Numeric: average
    const avg = (
      data.reduce((sum, d) => sum + Number(d.value), 0) / data.length
    ).toFixed(1);
    return `Average: ${avg}`;
  } else if (/^(yes|no)$/i.test(sample)) {
    // Yes/No: count Yes
    const yesCount = data.filter(d => String(d.value).toLowerCase() === 'yes').length;
    return `Yes: ${yesCount} days`;
  } else if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(sample)) {
    // Time: average time
    const mins = data.map(d => {
      const [h, m, period] = d.value.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i).slice(1);
      let hour = parseInt(h, 10);
      const min = parseInt(m, 10);
      if (/PM/i.test(period) && hour !== 12) hour += 12;
      if (/AM/i.test(period) && hour === 12) hour = 0;
      return hour * 60 + min;
    });
    const avgMin = mins.reduce((a, b) => a + b, 0) / mins.length;
    const hour = Math.floor(avgMin / 60);
    const min = Math.round(avgMin % 60);
    return `Avg: ${hour}:${min.toString().padStart(2, '0')}`;
  }
  return "Tracked";
}

document.addEventListener("DOMContentLoaded", async () => {
  allData = await loadData();
  allHabits = getHabitsFromMockData(allData);
  renderSidebar(allHabits);
  renderDashboardCards();
});

// Expose for chart.js
window.getHabitData = function(habit) {
  return allData[habit] || [];
};