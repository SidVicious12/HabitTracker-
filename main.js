const API_URL = 'https://script.google.com/macros/s/AKfycbwoTbwvIrcNLsoqtJTTbj6zSnTPf4Rg6SrsBX450HyO-bxSlCqAUHkQA6qticRGtv_SNg/exec';


async function fetchData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    console.log("Fetched data:", data); // 👈 Debug log

    const parsed = data
    .filter(entry => entry.Timestamp)
    .map(entry => {
      const ts = new Date(entry.Timestamp);
      const date = ts.toISOString().split("T")[0];
      const hour = ts.getHours();
      return { date, hour };
    });

    if (parsed.length === 0) {
      document.getElementById('stats').innerText = "No valid walks found.";
      return;
    }

    document.getElementById('stats').innerText = `Total Walks: ${parsed.length}`;

    new Chart(document.getElementById("walkChart"), {
      type: 'bar',
      data: {
        labels: parsed.map(item => item.date),
        datasets: [{
          label: 'Hour of Walk',
          data: parsed.map(item => item.hour),
          backgroundColor: '#2ecc71'
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