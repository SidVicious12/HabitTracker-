function renderHabitChart(habit, data) {
  if (!data || data.length === 0) return;

  // Type detection helpers
  const isNumber = val => !isNaN(parseFloat(val));
  const isTime = val => /^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(val);
  const isYesNo = val => /^(yes|no)$/i.test(val);

  // Guess type from first value
  const sample = data[0].value;
  let chartType = 'bar';
  let labels = data.map(d => d.date);
  let dataset = [];

  if (isNumber(sample)) {
    chartType = 'line';
    dataset = data.map(d => parseFloat(d.value));
  } else if (isTime(sample)) {
    chartType = 'bar';
    // Convert times to minutes since midnight for charting
    dataset = data.map(d => {
      const [h, m] = d.value.split(/:| /);
      let hour = parseInt(h, 10);
      const min = parseInt(m, 10);
      if (/PM/i.test(d.value) && hour !== 12) hour += 12;
      if (/AM/i.test(d.value) && hour === 12) hour = 0;
      return hour * 60 + min;
    });
  } else if (isYesNo(sample)) {
    chartType = 'bar';
    // Count Yes/No per date
    dataset = data.map(d => d.value.toLowerCase() === 'yes' ? 1 : 0);
  } else {
    // Fallback: treat as string category
    chartType = 'bar';
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
        fill: chartType === 'line',
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
          ticks: {
            color: '#e6fefb'
          },
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