const API_URL = 'https://script.google.com/macros/s/AKfycbwoTbwvIrcNLsoqtJTTbj6zSnTPf4Rg6SrsBX450HyO-bxSlCqAUHkQA6qticRGtv_SNg/exec';

async function fetchData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const parsed = data.map(entry => {
      const [date, time] = entry.Timestamp.split(" ");
      const hour = parseInt(time.split(":")[0], 10); // extract the hour
      return { date, hour };
    });

    document.getElementById('stats').innerText = `Total Walks: ${parsed.length}`;

    new Chart(document.getElementById("walkChart"), {
      type: 'bar',
      data: {
        labels: parsed.map(item => item.date),
        datasets: [{
          label: 'Hour of Walk',
          data: parsed.map(item => item.hour),
          backgroundColor: '#9b59b6'
        }]
      },
      options: {
        scales: {
          y: {
            title: {
              display: true,
              text: 'Hour of Day'
            },
            min: 0,
            max: 23,
            ticks: {
              stepSize: 1
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });

  } catch (err) {
    document.getElementById('stats').innerText = 'Failed to load data.';
    console.error('Fetch error:', err);
  }
}

fetchData();