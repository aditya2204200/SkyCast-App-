// 🌤️ Dynamic Background Function
const setDynamicBackground = () => {
  const hour = new Date().getHours();
  const bg = document.querySelector(".bg-fixed");

  if (!bg) return;

  // reset
  bg.className = "bg-fixed";

  if (hour >= 5 && hour < 11) {
    bg.classList.add("bg-morning"); // 🌅
  } else if (hour >= 11 && hour < 16) {
    bg.classList.add("bg-afternoon"); // ☀️
  } else if (hour >= 16 && hour < 19) {
    bg.classList.add("bg-evening"); // 🌇
  } else {
    bg.classList.add("bg-night"); // 🌙
  }
};

// 🌍 Weather Function
const getWeather = async (city) => {
  try {
    // 🔥 background update on every search
    setDynamicBackground();

    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      document.getElementById("errorMsg").innerText =
        "❌ Location not found. Please enter correct name.";
      return;
    }

    const input = city.toLowerCase().trim();

    let matched = geoData.results.find(
      (item) =>
        item.name.toLowerCase() === input ||
        item.admin1?.toLowerCase() === input,
    );

    if (!matched) {
      document.getElementById("errorMsg").innerText =
        "❌ Please enter correct spelling (e.g., Delhi, Bihar).";
      return;
    }

    if (input.length < 3) {
      document.getElementById("errorMsg").innerText =
        "❌ Please enter full name.";
      return;
    }

    document.getElementById("errorMsg").innerText = "";

    const lat = matched.latitude;
    const lon = matched.longitude;

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`,
    );
    const data = await res.json();

    // UI update
    document.getElementById("cityName").innerText = matched.name;

    document.getElementById("temp").innerText =
      data.current_weather.temperature + " °C";

    document.getElementById("wind").innerText =
      data.current_weather.windspeed + " km/h";

    document.getElementById("wind_dir").innerText =
      data.current_weather.winddirection + "°";

    // Humidity
    const timeIndex = data.hourly.time.indexOf(data.current_weather.time);

    let humidity = "--";
    if (timeIndex !== -1) {
      humidity = data.hourly.relativehumidity_2m[timeIndex];
    }

    document.getElementById("humidity").innerText = humidity + " %";

    // Alert
    if (humidity !== "--" && humidity > 70) {
      alert("⚠️ High humidity! It may feel uncomfortable outside.");
    }
  } catch (error) {
    console.error(error);
  }
};

// 🚀 Page load pe bhi run karo
setDynamicBackground();

// Default city
getWeather("Delhi");

// Search
document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const city = document.getElementById("city").value;
  getWeather(city);
});
