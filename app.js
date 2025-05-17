const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwoTbwvIrcNLsoqtJTTbj6zSnTPf4Rg6SrsBX450HyO-bxSlCqAUHkQA6qticRGtv_SNg/exec'; // Replace with your endpoint

async function fetchHabitData() {
  const res = await fetch(SHEET_URL);
  return await res.json();
}

function groupByHabit(data) {
  return data.reduce((acc, entry) => {
    if (!acc[entry.Habit]) acc[entry.Habit] = [];
    acc[entry.Habit].push(entry);
    return acc;
  }, {});
}

function renderSidebar(habits) {
  const habitList = document.getElementById('habit-list');
  habitList.innerHTML = '';
  habits.forEach((habit, idx) => {
    const li = document.createElement('li');
    li.textContent = habit;
    if (idx === 0) li.classList.add('active');
    li.onclick = () => {
      document.querySelectorAll('#habit-list li').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      renderMainContent(habit);
    };
    habitList.appendChild(li);
  });
}

let groupedData = {};
let habits = [];

function renderMainContent(selectedHabit = habits[0]) {
  const main = document.getElementById('main-content');
  main.innerHTML = '';
  habits.forEach(habit => {
    if (selectedHabit && habit !== selectedHabit) return;
    const entries = groupedData[habit] || [];
    const card = document.createElement('div');
    card.className = 'habit-card';
    card.innerHTML = `
      <div class="habit-header">
        <span class="habit-title">${habit}</span>
        <span class="habit-summary">${getSummary(entries, habit)}</span>
      </div>
      <canvas id="chart-${habit}"></canvas>
    `;
    main.appendChild(card);
    setTimeout(() => renderChart(`chart-${habit}`, entries, habit), 100);
  });
}

function getSummary(entries, habit) {
  // Customize summary logic per habit type
  if (habit === 'Walk') {
    return entries.length + ' walks';
  } else if (habit === 'Sleep') {
    const avg = (entries.reduce((sum, e) => sum + parseFloat(e.Value), 0) / entries.length) || 0;
    return avg.toFixed(1) + ' hrs avg';
  } else if (habit === 'Water') {
    const total = entries.reduce((sum, e) => sum + parseInt(e.Value), 0);
    return total + ' glasses';
  }
  return entries.length;
}

function renderChart(canvasId, entries, habit) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const labels = entries.map(e => e.Timestamp);
  const data = entries.map(e => parseFloat(e.Value));
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: habit,
        data,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

async function init() {
  const data = await fetchHabitData();
  groupedData = groupByHabit(data);
  habits = Object.keys(groupedData);
  renderSidebar(habits);
  renderMainContent();
}

init();