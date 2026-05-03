// 🌤️ Dynamic Background
const setDynamicBackground = () => {
  const hour = new Date().getHours();
  const bg = document.querySelector(".bg-fixed");
  const body = document.body;

  if (!bg) return;

  bg.className = "bg-fixed";
  body.classList.remove("night-mode");

  if (hour >= 5 && hour < 11) {
    bg.classList.add("bg-morning");
  } else if (hour >= 11 && hour < 16) {
    bg.classList.add("bg-afternoon");
  } else if (hour >= 16 && hour < 19) {
    bg.classList.add("bg-evening");
  } else {
    bg.classList.add("bg-night");
    body.classList.add("night-mode");
  }
};

// 🌧️ Rain Effect
const createRain = (count = 100) => {
  const rainContainer = document.querySelector(".rain");
  if (!rainContainer) return;

  rainContainer.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const drop = document.createElement("div");
    drop.classList.add("drop");

    drop.style.left = Math.random() * 100 + "vw";
    drop.style.animationDuration = 0.5 + Math.random() * 1 + "s";
    drop.style.opacity = Math.random();

    rainContainer.appendChild(drop);
  }
};

// ⚡ Lightning
const createLightning = () => {
  const container = document.querySelector(".lightning");
  if (!container) return;

  const flash = document.createElement("div");
  flash.classList.add("flash");

  container.appendChild(flash);

  setTimeout(() => flash.remove(), 200);
};

// 🌍 WEATHER BY COORDS (🔥 FIXED WITH MIN/MAX)
const getWeatherByCoords = async (lat, lon, cityName) => {
  try {
    setDynamicBackground();

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
    );

    const data = await res.json();

    const weatherCode = data.current_weather.weathercode;

    // 🌧️ Rain codes
    const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82];

    if (rainCodes.includes(weatherCode)) {
      createRain(120);

      setInterval(() => {
        if (Math.random() < 0.4) createLightning();
      }, 3000);
    } else {
      const rain = document.querySelector(".rain");
      if (rain) rain.innerHTML = "";
    }

    // =============================
    // 🌍 UI UPDATE
    // =============================

    document.getElementById("cityName").innerHTML =
      `<i class="bi bi-geo-alt-fill"></i> ${cityName}`;

    document.getElementById("temp").innerText =
      data.current_weather.temperature + " °C";

    // 🔥 MIN MAX FIX ADDED HERE
    document.getElementById("min_temp").innerText =
      data.daily?.temperature_2m_min?.[0] + " °C";

    document.getElementById("max_temp").innerText =
      data.daily?.temperature_2m_max?.[0] + " °C";

    document.getElementById("wind").innerText =
      data.current_weather.windspeed + " km/h";

    document.getElementById("wind_dir").innerText =
      data.current_weather.winddirection + "°";

    // humidity
    const timeIndex = data.hourly.time.indexOf(data.current_weather.time);
    let humidity = "--";

    if (timeIndex !== -1) {
      humidity = data.hourly.relativehumidity_2m[timeIndex];
    }

    document.getElementById("humidity").innerText = humidity + " %";
    document.getElementById("errorMsg").innerText = "";
  } catch (err) {
    console.error(err);
    document.getElementById("errorMsg").innerText = "⚠️ Weather load error";
  }
};

// 🌍 CITY SEARCH
const getWeather = async (city) => {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
    );

    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      document.getElementById("errorMsg").innerText = "❌ City not found";
      return;
    }

    const place = geoData.results[0];

    localStorage.setItem("lastCity", place.name);

    getWeatherByCoords(place.latitude, place.longitude, place.name);
  } catch (err) {
    console.error(err);
    document.getElementById("errorMsg").innerText = "⚠️ Search error";
  }
};

// 🌍 COMMON CITIES
const loadCommonPlaces = async () => {
  const cities = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore"];
  const table = document.getElementById("commonWeather");

  if (!table) return;

  table.innerHTML = "";

  for (let city of cities) {
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
      );
      const geoData = await geoRes.json();

      if (!geoData.results) continue;

      const { latitude, longitude, name } = geoData.results[0];

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
      );
      const data = await res.json();

      table.innerHTML += `
        <tr>
          <td>${name}</td>
          <td>${data.current_weather.temperature}</td>
          <td>${data.current_weather.windspeed}</td>
        </tr>
      `;
    } catch (err) {
      console.error(err);
    }
  }
};

// 🚀 ON LOAD
window.addEventListener("load", () => {
  setDynamicBackground();
  loadCommonPlaces();

  const popup = document.getElementById("locationPopup");
  if (popup) popup.classList.add("show");

  document.getElementById("allowLocation").onclick = async () => {
    if (popup) popup.classList.remove("show");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        let city = "📍 Your Location";

        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
          );

          const data = await geoRes.json();
          city = data.city || data.locality || city;
        } catch {}

        localStorage.setItem("lastCity", city);
        getWeatherByCoords(lat, lon, city);
      },
      () => getWeather("Delhi"),
    );
  };

  document.getElementById("denyLocation").onclick = () => {
    if (popup) popup.classList.remove("show");

    const lastCity = localStorage.getItem("lastCity");
    getWeather(lastCity || "Delhi");
  };
});

// 🔍 SEARCH
document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const city = document.getElementById("city").value.trim();

  if (!city) return;

  getWeather(city);
});

// 📌 Navbar shrink
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");

  if (!navbar) return;

  if (window.scrollY > 50) {
    navbar.classList.add("shrink");
  } else {
    navbar.classList.remove("shrink");
  }
});

// 🔽 sab code ke baad
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => console.log("✅ Service Worker Registered"))
      .catch((err) => console.log("❌ SW Error:", err));
  });
}

/**======================related to App=============== */

const clouds = document.querySelector(".clouds");

// reset
if (clouds) clouds.style.display = "none";

if (hour >= 5 && hour < 11) {
  bg.classList.add("bg-morning");

  // 🌤️ morning → clouds ON
  if (clouds) clouds.style.display = "block";
} else if (hour >= 11 && hour < 16) {
  bg.classList.add("bg-afternoon");

  // ☀️ afternoon → clouds OFF
} else if (hour >= 16 && hour < 19) {
  bg.classList.add("bg-evening");

  // 🌇 evening → light clouds (optional)
  if (clouds) {
    clouds.style.display = "block";
    clouds.style.opacity = "0.2";
  }
} else {
  bg.classList.add("bg-night");

  // 🌙 night → clouds OFF
}
