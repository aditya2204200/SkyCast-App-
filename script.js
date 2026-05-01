const getWeather = async (city) => {
  try {
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

    // 🔥 SMART MATCH
    let matched = geoData.results.find(
      (item) =>
        item.name.toLowerCase() === input ||
        item.admin1?.toLowerCase() === input,
    );

    // ❌ agar kuch bhi match nahi hua
    if (!matched) {
      document.getElementById("errorMsg").innerText =
        "❌ Please enter correct spelling (e.g., Delhi, Bihar).";
      return;
    }

    // ❌ short input reject (bhr)
    if (input.length < 3) {
      document.getElementById("errorMsg").innerText =
        "❌ Please enter full name.";
      return;
    }

    // Clear error
    document.getElementById("errorMsg").innerText = "";

    const lat = matched.latitude;
    const lon = matched.longitude;

    // Weather API
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

    // Humidity correct
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

// Default
getWeather("Delhi");

// Search
document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const city = document.getElementById("city").value;
  getWeather(city);
});
