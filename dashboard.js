// Populate sidebar and handle clicks
const habitList = document.getElementById('habit-list');
const chartTitle = document.getElementById('chart-title');

// Render sidebar
Object.keys(mockData).forEach((habit, idx) => {
  const li = document.createElement('li');
  li.textContent = habit;
  li.className = 'sidebar-item';
  if (idx === 0) li.classList.add('active');
  li.onclick = () => {
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    li.classList.add('active');
    chartTitle.textContent = habit;
    renderHabitChart(habit, mockData[habit]);
  };
  habitList.appendChild(li);
});

// Render first habit by default
const firstHabit = Object.keys(mockData)[0];
if (firstHabit) {
  chartTitle.textContent = firstHabit;
  renderHabitChart(firstHabit, mockData[firstHabit]);
}