{{ ... }}
// Mini chart for card
function renderMiniHabitChart(habit, data, canvasId) {
  if (!data || data.length === 0) return;

  // Type detection
  const isNumber = val => typeof val === 'number' || !isNaN(Number(val));
  const isYesNo = val => /^(yes|no)$/i.test(val);
  const isTime = val => /^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(val);

  const sample = data[0].value;
  let chartType = 'bar';
  let labels = data.map(d => d.date);
  let dataset = [];

  if (isNumber(sample)) {
    dataset = data.map(d => Number(d.value));
    chartType = 'line';
  } else if (isYesNo(sample)) {
    dataset = data.map(d => d.value.toLowerCase() === 'yes' ? 1 : 0);
    chartType = 'bar';
  } else if (isTime(sample)) {
    dataset = data.map(d => {
      const [h, m, period] = d.value.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i).slice(1);
      let hour = parseInt(h, 10);
      const min = parseInt(m, 10);
      if (/PM/i.test(period) && hour !== 12) hour += 12;
      if (/AM/i.test(period) && hour === 12) hour = 0;
      return hour * 60 + min;
    });
    chartType = 'bar';
  } else {
    dataset = data.map(d => d.value);
    chartType = 'bar';
  }

  // Destroy previous chart if any
  if (window[`miniChart_${canvasId}`]) window[`miniChart_${canvasId}`].destroy();

  window[`miniChart_${canvasId}`] = new Chart(document.getElementById(canvasId).getContext('2d'), {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        label: habit,
        data: dataset,
        backgroundColor: '#ffd9b3',
        borderColor: '#b05e19',
        borderWidth: 2,
        fill: chartType === 'line',
        tension: 0.35,
        pointRadius: 0
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#b05e19', font: { size: 10 } },
          grid: { color: '#f2e5d7' }
        },
        x: {
          ticks: { color: '#b05e19', font: { size: 10 }, maxRotation: 0 },
          grid: { display: false }
        }
      }
    }
  });
}
{{ ... }}