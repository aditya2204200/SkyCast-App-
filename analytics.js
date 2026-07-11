const ctx = document.getElementById("weatherChart");

const weatherChart = new Chart(ctx, {
  type: "line",

  data: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],

    datasets: [
      {
        label: "Temperature",
        data: [18, 22, 28, 33, 40, 42, 38, 35, 31, 27, 22, 18],
        borderColor: "#ff4d4d",
        backgroundColor: "rgba(255,77,77,0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#fff",
      },
    ],
  },

  options: {
    responsive: true,

    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255,255,255,.08)",
        },
      },

      y: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255,255,255,.08)",
        },
      },
    },
  },
});
const overview = document.getElementById("overviewChart");

new Chart(overview, {
  type: "doughnut",

  data: {
    labels: ["Rain", "Sunny", "Cloudy"],

    datasets: [
      {
        data: [30, 50, 20],

        backgroundColor: ["#2196f3", "#fbc02d", "#8e44ad"],

        borderWidth: 0,
      },
    ],
  },

  options: {
    responsive: true,
    maintainAspectRatio: false,

    cutout: "70%",

    plugins: {
      legend: {
        display: false,
      },
    },
  },
});

const tempBtn = document.getElementById("tempBtn");
const rainBtn = document.getElementById("rainBtn");
const humidityBtn = document.getElementById("humidityBtn");
const windBtn = document.getElementById("windBtn");

const temperatureData = [18, 22, 28, 33, 40, 42, 38, 35, 31, 27, 22, 18];

const rainData = [20, 35, 60, 80, 120, 180, 250, 230, 160, 70, 30, 15];

const humidityData = [40, 42, 48, 55, 65, 78, 88, 86, 75, 60, 48, 42];

const windData = [8, 10, 12, 15, 18, 20, 16, 14, 12, 10, 8, 7];

function updateChart(label, data, color) {
  weatherChart.data.datasets[0].label = label;

  weatherChart.data.datasets[0].data = data;

  weatherChart.data.datasets[0].borderColor = color;

  weatherChart.data.datasets[0].backgroundColor = color + "33";

  weatherChart.update();
}

function removeActive() {
  tempBtn.classList.remove("active");
  rainBtn.classList.remove("active");
  humidityBtn.classList.remove("active");
  windBtn.classList.remove("active");
}

tempBtn.onclick = ()=>{

    removeActive();
    tempBtn.classList.add("active");

    updateChart("Temperature",
    temperatureData,
    "#ff4d4d");

};

rainBtn.onclick = ()=>{

    removeActive();
    rainBtn.classList.add("active");

    updateChart("Precipitation",
    rainData,
    "#2196f3");

};

humidityBtn.onclick = ()=>{

    removeActive();
    humidityBtn.classList.add("active");

    updateChart("Humidity",
    humidityData,
    "#00e5ff");

};

windBtn.onclick = ()=>{

    removeActive();
    windBtn.classList.add("active");

    updateChart("Wind",
    windData,
    "#8bc34a");

};