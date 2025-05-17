const API_URL = 'https://script.google.com/macros/s/AKfycbwoTbwvIrcNLsoqtJTTbj6zSnTPf4Rg6SrsBX450HyO-bxSlCqAUHkQA6qticRGtv_SNg/exec';

async function fetchData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const dates = data.map(entry => entry.Date);
    document.getElementById('stats').innerText = `Total Walks: ${dates.length}`;

    new Chart(document.getElementById("walkChart"), {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [{
          label: 'Daily Walks',
          data: Array(dates.length).fill(1),
        }]
      }
    });
  } catch (err) {
    document.getElementById('stats').innerText = 'Failed to load data.';
    console.error('Error fetching data:', err);
  }
}

fetchData();