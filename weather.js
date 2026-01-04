const API_KEY = "b2505c80787aa9731f5239135c6c33d8"; 
let chart = null;

function showLoader() {
  document.getElementById("loader").style.display = "block";
  document.getElementById("content").classList.add("hidden");
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("content").classList.remove("hidden");
}

/* CITY SEARCH */
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();

  if (!city) {
    alert("Enter city name");
    return;
  }

  showLoader();

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      hideLoader();
      alert(data.error.message);
      return;
    }

    updateUI(data);
    hideLoader();

  } catch {
    hideLoader();
    alert("Network error");
  }
}

/* LOCATION WEATHER */
function getLocationWeather() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  showLoader();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=7`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
          hideLoader();
          alert(data.error.message);
          return;
        }

        updateUI(data);
        hideLoader();

      } catch {
        hideLoader();
        alert("Network error");
      }
    },
    () => {
      hideLoader();
      alert("Location permission denied");
    }
  );
}

/* UI UPDATE */
function updateUI(data) {
  document.getElementById("temp").innerText = data.current.temp_c;
  document.getElementById("humidity").innerText = data.current.humidity;
  document.getElementById("wind").innerText = data.current.wind_kph;

  drawChart(data);
  renderForecast(data);
}

/* CHART */
function drawChart(data) {
  const labels = data.forecast.forecastday.map(d => d.date);
  const temps = data.forecast.forecastday.map(d => d.day.avgtemp_c);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Avg Temp (°C)",
        data: temps,
        borderColor: "#38bdf8",
        tension: 0.4
      }]
    }
  });
}

/* FORECAST */
function renderForecast(data) {
  const el = document.getElementById("forecast");
  el.innerHTML = "";

  data.forecast.forecastday.forEach(day => {
    el.innerHTML += `
      <div class="forecast-card">
        <p>${day.date}</p>
        <img src="${day.day.condition.icon}">
        <p>${day.day.avgtemp_c}°C</p>
        <p>${day.day.condition.text}</p>
      </div>
    `;
  });
}
