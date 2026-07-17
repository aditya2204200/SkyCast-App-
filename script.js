//  NOTIFICATION PERMISSION
if ("Notification" in window) {
  Notification.requestPermission().then((permission) => {
    console.log("Notification Permission:", permission);
  });
}

//  Dynamic Background + Clouds
const setDynamicBackground = () => {
  const hour = new Date().getHours();
  const bg = document.querySelector(".bg-fixed");
  const body = document.body;
  const clouds = document.querySelector(".clouds");

  if (!bg) return;

  bg.className = "bg-fixed";
  body.classList.remove("night-mode");

  if (clouds) clouds.style.display = "none";

  if (hour >= 5 && hour < 11) {
    bg.classList.add("bg-morning");
    if (clouds) clouds.style.display = "block";
  } else if (hour >= 11 && hour < 16) {
    bg.classList.add("bg-afternoon");
  } else if (hour >= 16 && hour < 19) {
    bg.classList.add("bg-evening");
    if (clouds) {
      clouds.style.display = "block";
      clouds.style.opacity = "0.2";
    }
  } else {
    bg.classList.add("bg-night");
    body.classList.add("night-mode");
  }
};

//  Rain
let lightningInterval;

const createRain = (count = 100) => {
  const rain = document.querySelector(".rain");
  if (!rain) return;

  rain.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const drop = document.createElement("div");
    drop.className = "drop";
    drop.style.left = Math.random() * 100 + "vw";
    drop.style.animationDuration = 0.5 + Math.random() + "s";
    rain.appendChild(drop);
  }
};

const stopRain = () => {
  const rain = document.querySelector(".rain");
  if (rain) rain.innerHTML = "";

  clearInterval(lightningInterval);
};

//  Lightning
const createLightning = () => {
  const container = document.querySelector(".lightning");
  if (!container) return;

  const flash = document.createElement("div");
  flash.className = "flash";
  container.appendChild(flash);

  setTimeout(() => flash.remove(), 200);
  askAI;
};

//  Weather API
const getWeatherByCoords = async (lat, lon, cityName) => {
  try {
    setDynamicBackground();
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max&timezone=auto`,
    );
    const data = await res.json();

    const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82];

    const isRaining = rainCodes.includes(data.current.weather_code);

    //  ab isRaining use kar
    if (isRaining) {
      createRain(120);

      clearInterval(lightningInterval);
      lightningInterval = setInterval(() => {
        if (Math.random() < 0.4) createLightning();
      }, 3000);
    } else {
      stopRain();
    }
    if (map && marker) {
      map.setView([lat, lon], 8);

      marker
        .setLatLng([lat, lon])
        .bindPopup(
          `
       ${cityName} <br>
       ${data.current.temperature_2m}°C
    `,
        )
        .openPopup();
    }

    // UI update
    document.getElementById("cityName").innerHTML =
      `<i class="bi bi-geo-alt-fill"></i> ${cityName}`;

    document.getElementById("temp").innerText =
      data.current.temperature_2m + " °C";

    document.getElementById("min_temp").innerText =
      data.daily.temperature_2m_min[0] + " °C";

    document.getElementById("max_temp").innerText =
      data.daily.temperature_2m_max[0] + " °C";
    document.getElementById("detailWind").innerText =
      data.current.wind_speed_10m;
    // compass update
    updateWindUI(data.current.wind_direction_10m);
    console.log("Wind Degree:", data.current.wind_direction_10m);

    const currentTime = new Date(data.current.time);

    // find closest time index
    document.getElementById("humidity").innerText =
      data.current.relative_humidity_2m + " %";

    document.getElementById("humidity").innerText =
      data.current.relative_humidity_2m + " %";

    //  REAL UV INDEX
    const uv = data.daily.uv_index_max[0];

    document.getElementById("uvIndex").innerText = uv;

    let uvText = "Low";
    let uvAdvice = "Safe to go outside.";

    if (uv >= 3 && uv < 6) {
      uvText = "Moderate";
      uvAdvice = "Use sunglasses and sunscreen outdoors.";
    } else if (uv >= 6 && uv < 8) {
      uvText = "High";
      uvAdvice = "Reduce direct sun exposure.";
    } else if (uv >= 8) {
      uvText = "Extreme";
      uvAdvice = "Avoid going outside during peak hours.";
    }

    document.getElementById("uvLevel").innerText = uvText;

    document.getElementById("uvAdvice").innerText = uvAdvice;

    //  DETAILS SECTION UPDATE

    document.getElementById("detailTemp").innerText =
      data.current.temperature_2m + "°";

    document.getElementById("detailFeels").innerText =
      data.current.apparent_temperature + "°";

    document.getElementById("detailActual").innerText =
      data.current.temperature_2m + "°";

    document.getElementById("detailHumidity").innerText =
      data.current.relative_humidity_2m + "%";

    const weatherCode = data.current.weather_code;

    if (weatherCode <= 3) {
      document.getElementById("cloudText").innerText = "Sunny";
    } else {
      document.getElementById("cloudText").innerText = "Cloudy";
    }
    loadClimateData(lat, lon);

    document.getElementById("errorMsg").innerText = "";
  } catch (err) {
    console.error(err);
    document.getElementById("errorMsg").innerText = err.message;
  }
};

//  City search
const getWeather = async (city) => {
  try {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
    );
    const data = await geo.json();

    if (!data.results) return alert("City not found");

    const place = data.results[0];

    localStorage.setItem("lastCity", place.name);

    //  ADD THIS (MAP SYNC)
    if (typeof map !== "undefined" && typeof marker !== "undefined") {
      map.flyTo([place.latitude, place.longitude], 8, {
        animate: true,
        duration: 1.5,
      });

      marker.setLatLng([place.latitude, place.longitude]);
    }

    // existing call
    getWeatherByCoords(place.latitude, place.longitude, place.name);
  } catch {
    alert("Search error");
  }
};

//  Common cities
const loadCommonPlaces = async () => {
  const cities = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore"];
  const table = document.getElementById("commonWeather");

  table.innerHTML = "";

  for (let city of cities) {
    try {
      const geo = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
      );
      const g = await geo.json();

      if (!g.results) continue;

      const { latitude, longitude, name } = g.results[0];

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`,
      );

      const d = await res.json();

      table.innerHTML += `
<tr>
  <td>${name}</td>
  <td>${d.current.temperature_2m} °C</td>
  <td>${d.current.wind_speed_10m} km/h</td>
</tr>`;
    } catch {}
  }
};

//  LOAD
window.addEventListener("load", () => {
  setDynamicBackground();
  loadCommonPlaces();

  const popup = document.getElementById("locationPopup");
  popup?.classList.add("show");

  document.getElementById("allowLocation").onclick = async () => {
    popup?.classList.remove("show");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        let cityName = " Your Location";

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
          );

          const data = await res.json();

          cityName =
            data.city ||
            data.locality ||
            data.principalSubdivision ||
            data.localityInfo?.administrative?.[2]?.name ||
            " Your Location";
        } catch (err) {
          console.log("City fetch error");
        }

        getWeatherByCoords(lat, lon, cityName);
      },
      () => getWeather("Delhi"),
    );
  };

  document.getElementById("denyLocation").onclick = () => {
    popup?.classList.remove("show");
    getWeather(localStorage.getItem("lastCity") || "Delhi");
  };
});

//  Search
document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const city = document.getElementById("city").value.trim();
  if (city) getWeather(city);
});

//  Navbar shrink
window.addEventListener("scroll", () => {
  document
    .querySelector(".navbar")
    ?.classList.toggle("shrink", window.scrollY > 50);
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

function getWindDirection(deg) {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return directions[Math.round(deg / 22.5) % 16];
}

function updateWindUI(degree) {
  const arrow = document.getElementById("miniArrow");
  const text = document.getElementById("windDirectionText");

  if (!arrow || !text) return;

  // rotate arrow
  arrow.style.transform = `translateX(-50%) rotate(${degree}deg)`;

  // direction text
  const dir = getWindDirection(degree);

  text.innerText = `Direction: ${dir} (${degree}°)`;
}

//  MAP INIT
let map;
let marker;
let lightLayer;
let darkLayer;

window.addEventListener("load", () => {
  //  INIT MAP
  map = L.map("map").setView([28.61, 77.23], 5);

  setTimeout(() => {
    map.invalidateSize();
  }, 200);

  lightLayer = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      subdomains: "abcd",
      maxZoom: 20,
    },
  );

  darkLayer = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      subdomains: "abcd",
      maxZoom: 20,
    },
  );
  const labels = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
    {
      attribution: "&copy; CARTO",
      subdomains: "abcd",
    },
  );

  //  default layer
  lightLayer.addTo(map);

  //  NIGHT MODE CHECK
  if (document.body.classList.contains("night-mode")) {
    map.removeLayer(lightLayer);

    darkLayer.addTo(map);

    labels.addTo(map);
  }

  //  MARKER
  marker = L.marker([28.61, 77.23])
    .addTo(map)
    .bindPopup(" Click map to get weather");

  //  CLICK EVENT (INSIDE LOAD)
  map.on("click", async function (e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;

    //  marker move
    marker.setLatLng([lat, lon]);

    //  camera smooth move
    map.flyTo([lat, lon], 8, {
      animate: window.innerWidth > 768,
      duration: 1,
    });

    //  existing weather UI update bhi chalega
    getWeatherByCoords(lat, lon, "Selected Location");

    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
      );
      const data = await res.json();

      const temp = data.current_weather.temperature;
      const wind = data.current_weather.windspeed;

      //  POPUP
      marker
        .bindPopup(
          `
    <div style="text-align:center;">
      <h6> Selected Location</h6>
      <p> Temp: ${temp} °C</p>
      <p> Wind: ${wind} km/h</p>
    </div>
  `,
        )
        .openPopup();
    } catch (err) {
      console.log("Map weather error");
    }
  });
});

const openAI = document.getElementById("openAI");
const closeAI = document.getElementById("closeAI");
const aiPopup = document.getElementById("aiPopup");
const askAI = document.getElementById("askAI");
const chatBox = document.getElementById("chatBox");

openAI.addEventListener("click", () => {
  aiPopup.classList.add("show");
});

closeAI.addEventListener("click", () => {
  aiPopup.classList.remove("show");
});

askAI.addEventListener("click", sendMessage);

document
  .getElementById("userQuestion")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

async function sendMessage() {
  const input = document.getElementById("userQuestion");
  const question = input.value.trim();

  if (!question) return;

  chatBox.innerHTML += `
    <div class="user-msg">${question}</div>
  `;

  input.value = "";

  try {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: question,
      }),
    });

    const data = await response.json();

    const botDiv = document.createElement("div");
    botDiv.className = "bot-msg";
    botDiv.textContent = data.reply;
    chatBox.appendChild(botDiv);

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
    chatBox.innerHTML += `
      <div class="bot-msg">Error connecting AI</div>
    `;
  }
}

// ================= Climate Analytics =================

let weatherChart;

async function loadClimateData(lat, lon) {
  const res = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2025-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
  );

  const data = await res.json();

  const maxMonthly = Array(12).fill(0);
  const minMonthly = Array(12).fill(0);
  const count = Array(12).fill(0);

  data.daily.time.forEach((date, i) => {
    const month = new Date(date).getMonth();

    maxMonthly[month] += data.daily.temperature_2m_max[i];
    minMonthly[month] += data.daily.temperature_2m_min[i];

    count[month]++;
  });

  for (let i = 0; i < 12; i++) {
    maxMonthly[i] /= count[i];
    minMonthly[i] /= count[i];
  }

  if (weatherChart) {
    weatherChart.destroy();
  }

  const ctx = document.getElementById("weatherChart");

  weatherChart = new Chart(ctx, {
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
          label: "Max Temp",
          data: maxMonthly,
          borderColor: "#ff4d4d",
          backgroundColor: "rgba(255,77,77,.2)",
          fill: true,
          tension: 0.4,
        },

        {
          label: "Min Temp",
          data: minMonthly,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,.15)",
          fill: true,
          tension: 0.4,
        },
      ],
    },

    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "white" },
        },
      },
      scales: {
        x: {
          ticks: { color: "white" },
          grid: { color: "rgba(255,255,255,.08)" },
        },
        y: {
          ticks: { color: "white" },
          grid: { color: "rgba(255,255,255,.08)" },
        },
      },
    },
  });
}
