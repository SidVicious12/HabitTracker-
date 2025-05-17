function renderHabitChart(habit, data) {
  if (!data || data.length === 0) return;

  // Detect value type
  const isNumber = val => typeof val === 'number' || !isNaN(Number(val));
  const isYesNo = val => /^(yes|no)$/i.test(val);

  const sample = data[0].value;
  let chartType = 'bar';
  let labels = data.map(d => d.date);
  let dataset = [];

  if (isNumber(sample)) {
    dataset = data.map(d => Number(d.value));
  } else if (isYesNo(sample)) {
    dataset = data.map(d => d.value.toLowerCase() === 'yes' ? 1 : 0);
  } else {
    dataset = data.map(d => d.value);
  }

  // Destroy previous chart if any
  if (window.habitChartInstance) window.habitChartInstance.destroy();

  window.habitChartInstance = new Chart(document.getElementById('habitChart').getContext('2d'), {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        label: habit,
        data: dataset,
        backgroundColor: '#1de9b6',
        borderColor: '#1de9b6',
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#e6fefb' },
          grid: { color: '#374151' }
        },
        x: {
          ticks: { color: '#e6fefb' },
          grid: { color: '#374151' }
        }
      }
    }
  });
}