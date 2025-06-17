import '@material/web/all.js';

const citySrc = document.getElementById("citySrc");
const search = document.getElementById("search");
const content = document.getElementById("mainContent");
const refresh = document.getElementById("refresh");
const suggestionsList = document.getElementById("suggestions");
document.addEventListener("click", (event) => {
  const input = document.getElementById("citySrc");
  const suggestions = document.getElementById("suggestions");
  if (!input.contains(event.target) && !suggestions.contains(event.target)) {
    suggestions.innerHTML = ""; 
    suggestionsList.style.display = "none";
  }
});
citySrc.addEventListener("input", async () => {
  const query = citySrc.value.trim();

  if (query.length < 3) {
    suggestionsList.innerHTML = ""; 
    suggestionsList.style.display = "none";
    return;
  }

try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    const data = await response.json();

    suggestionsList.innerHTML = ""; 
    if (data.results) {
          suggestionsList.style.display = "block";
      data.results.forEach((location) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${location.name}, ${location.country}`;
        listItem.addEventListener("click", () => {
          citySrc.value = location.name;
          suggestionsList.innerHTML = "";
          const unit = localStorage.getItem("savedUnit") || "metric";
          showWeather(location.name,unit,true);
          saveCityToLocalStorage(location.name);
          renderSavedCities();
          
        });
        suggestionsList.appendChild(listItem);
      });
    } else {
      const listItem = document.createElement("li");
      listItem.textContent = "No results found";
      suggestionsList.appendChild(listItem);
    }
  } catch (error) {
    console.error("Error fetching city suggestions:", error);
  }
});

function showMessage() {
  const msg = document.getElementById("message"); // or your main weather container

  if (msg) msg.style.display = "flex";
  if (content) content.style.display = "none";
}

function hideMessage() {
  const msg = document.getElementById("message");

  if (msg) msg.style.display = "none";
  if (content) content.style.display = "block";
}

const degToDir = (d) => {
  const directions = [
    { dir: "N", arrow: "↑" },
    { dir: "NNE", arrow: "↑" },
    { dir: "NE", arrow: "↗" },
    { dir: "ENE", arrow: "↗" },
    { dir: "E", arrow: "→" },
    { dir: "ESE", arrow: "→" },
    { dir: "SE", arrow: "↘" },
    { dir: "SSE", arrow: "↘" },
    { dir: "S", arrow: "↓" },
    { dir: "SSW", arrow: "↓" },
    { dir: "SW", arrow: "↙" },
    { dir: "WSW", arrow: "↙" },
    { dir: "W", arrow: "←" },
    { dir: "WNW", arrow: "←" },
    { dir: "NW", arrow: "↖" },
    { dir: "NNW", arrow: "↖" }
  ];
  const i = Math.floor((d % 360) / 22.5);
  const { dir, arrow } = directions[i];
  return `${arrow} ${dir}`;
};

function formatTimeWithOffset(timestampSeconds, timezoneOffsetSeconds) {
  if (typeof timestampSeconds !== 'number' || isNaN(timestampSeconds) ||
    typeof timezoneOffsetSeconds !== 'number' || isNaN(timezoneOffsetSeconds)) {
    return "N/A";
  }

  const utc = new Date(timestampSeconds * 1000);
  if (isNaN(utc.getTime())) return "N/A";

  const local = new Date(utc.getTime() + timezoneOffsetSeconds * 1000);
  const hh = local.getUTCHours().toString().padStart(2, '0');
  const mm = local.getUTCMinutes().toString().padStart(2, '0');

  return `${hh}:${mm}`;
}
function formatDurationHHMM(durationMs) {
  if (isNaN(durationMs) || durationMs < 0) return "N/A";
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

function getCustomIcon(iconCode) {
  const iconMap = {
    '01d': '/icons/clear_day.svg',
    '01n': '/icons/clear_night.svg',
    '02d': '/icons/partly_cloudy_day.svg',
    '02n': '/icons/partly_cloudy_night.svg',
    '03d': '/icons/cloudy.svg',
    '03n': '/icons/cloudy.svg',
    '04d': '/icons/mostly_cloudy_day.svg',
    '04n': '/icons/mostly_cloudy_night.svg',
    '09d': '/icons/drizzle.svg',
    '09n': '/icons/drizzle.svg',
    '10d': '/icons/rain_with_cloudy_light.svg',
    '10n': '/icons/rain_with_cloudy_dark.svg',
    '11d': '/icons/strong_thunderstorms.svg',
    '11n': '/icons/strong_thunderstorms.svg',
    '13d': '/icons/heavy_snow.svg',
    '13n': '/icons/heavy_snow.svg',
    '50d': '/icons/haze_fog_dust_smoke.svg',
    '50n': '/icons/haze_fog_dust_smoke.svg'
  };

  return iconMap[iconCode] || '/icons/umbrella.svg'; // fallback icon
}
function getDeviceType() {
  const width = window.innerWidth;
  if (width >= 1024) return 'desktop'; // or tablet
  if (width >= 768) return 'tablet';
  return 'mobile';
}

function getBackgroundImage(iconCode) {
  const deviceType = getDeviceType(); // returns 'mobile', 'tablet', or 'desktop'
  const folder = (deviceType === 'tablet' || deviceType === 'desktop') ? 'tablet' : 'mobile';

  const bgMap = {
    '01d': `/${folder}/01-sunny-home-laundry.webp`,
    '01n': `/${folder}/05-clear-creek-stars.webp`,
    '02d': `/${folder}/03-partly-cloudy-day-field-hiking.webp`,
    '02n': `/${folder}/07-partly-cloudy-night-field-fireflies.webp`,
    '03d': `/${folder}/09-cloudy-hills-coffee.webp`,
    '03n': `/${folder}/09-cloudy-hills-coffee.webp`,
    '04d': `/${folder}/09-cloudy-home-flowers.webp`,
    '04n': `/${folder}/07-partly-cloudy-night-field-fireflies.webp`,
    '09d': `/${folder}/11-rain-creek-leaf.webp`,
    '09n': `/${folder}/11-rain-home-inside.webp`,
    '10d': `/${folder}/11-rain-home-inside.webp`,
    '10n': `/${folder}/11-rain-home-inside.webp`,
    '11d': `/${folder}/22-iso-thunderstorms-home-inside.webp`,
    '11n': `/${folder}/22-iso-thunderstorms-home-inside.webp`,
    '13d': `/${folder}/15-snow-showers-snow-home-shoveling.webp`,
    '13n': `/${folder}/16-blowing-snow-field-snowman.webp`,
    '50d': `/${folder}/26-haze-fog-dust-smoke-bridge.webp`,
    '50n': `/${folder}/26-haze-fog-dust-smoke-mountain.webp`
  };

  return bgMap[iconCode] || `/${folder}/default.webp`;
}

function relativeTime(timeInMs) {
  const now = Date.now();
  const diff = now - timeInMs;

  if (diff < 1000) {
    return 'just now';
  }

  const units = [
    { unit: 'minute', factor: 60 * 1000 },
    { unit: 'hour', factor: 60 * 60 * 1000 },
    { unit: 'day', factor: 24 * 60 * 60 * 1000 },
    { unit: 'week', factor: 7 * 24 * 60 * 60 * 1000 },
    { unit: 'month', factor: 30 * 24 * 60 * 60 * 1000 },
    { unit: 'year', factor: 365 * 24 * 60 * 60 * 1000 },
  ];

  for (const { unit, factor } of units) {
    if (diff >= factor) {
      const value = Math.floor(diff / factor);
      return `${value} ${unit}${value > 1 ? 's' : ''} ago`;
    }
  }

  return 'a moment ago';
}

function getCachedData(key, maxAgeMinutes = 60) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp > maxAgeMinutes * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
}

function setCachedData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch (e) {
    console.error("Cache save error:", e);
  }
}
async function fetchAPI(url) {
  console.log("Fetching:", url); // 👈 Log the URL being fetched
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text(); // Get raw response text for debugging
    throw new Error(`Request failed: ${res.status}, Response: ${text}`);
  }
  return await res.json();
}

function parseHourlyData(list, tempUnitSymbol) {
  return list.slice(0, 6).map(hour => {
    const date = new Date(hour.dt * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    return {
      time: `${hours}:00`,
      temp: Math.round(hour.main.temp),
      weather: hour.weather[0].description,
      icon: hour.weather[0].icon,
      precipitation_probability: Math.round((hour.pop || 0) * 100),
      wind_speed: hour.wind.speed,
      maxTemp: Math.round(hour.main.temp_max),
      minTemp: Math.round(hour.main.temp_min)
    };
  }).map(h => ({ ...h, tempUnitSymbol }));
}

function parseDailyData(list, tempUnitSymbol) {
  const days = {};
  list.forEach(entry => {
    const date = new Date(entry.dt * 1000);
    const key = date.toISOString().split('T')[0];
    if (!days[key]) days[key] = [];
    days[key].push(entry);
  });

  return Object.entries(days).slice(0, 5).map(([dateStr, entries]) => {
    const avgPop = Math.round(entries.reduce((sum, e) => sum + (e.pop || 0), 0) / entries.length * 100);
    const midday = entries.find(e => [11, 12, 13].includes(new Date(e.dt * 1000).getHours())) || entries[0];

    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return {
      dayName,
      dayOfMonth,
      month,
      minTemp: Math.round(Math.min(...entries.map(e => e.main.temp_min))),
      maxTemp: Math.round(Math.max(...entries.map(e => e.main.temp_max))),
      precipitation_probability: avgPop,
      description: midday.weather[0].description,
      icon: midday.weather[0].icon
    };
  }).map(d => ({ ...d, tempUnitSymbol }));
}
async function getWeather(city, currentUnitPreference, forceRefresh = false) {
  const unit = currentUnitPreference || localStorage.getItem('unit') || "metric";
  const cacheKey = `owm_weather_${city.toLowerCase()}_${unit}`;

  if (forceRefresh) {
    localStorage.removeItem(cacheKey);
  }
  const cached = getCachedData(cacheKey);
  if (cached && !forceRefresh) {
    return cached;
  }
  const userApiKey = localStorage.getItem("userApiKey");
  let geoData, currentWeather, forecast, aqiData;

  if (userApiKey) {
    console.log("Using user-provided API key (Directly).");
    const API_KEY = userApiKey; 
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
    const geoResult = await fetchAPI(geoUrl);
    if (!geoResult.length) throw new Error("City not found");
    geoData = geoResult; // Store result

    const { lat, lon } = geoData[0];

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`;
    currentWeather = await fetchAPI(weatherUrl);

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`;
    forecast = await fetchAPI(forecastUrl);

    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const aqiRes = await fetch(aqiUrl);
    aqiData = aqiRes.ok ? await aqiRes.json() : null;

} else {
  console.log("Using default API key (via Secure Proxy).");
  const PROXY_URL = '/.netlify/functions/openweather';

  // 1. Geocoding
  const geoQuery = `q=${encodeURIComponent(city)}&limit=1`;
  const geoResult = await fetchAPI(`${PROXY_URL}?endpoint=/geo/1.0/direct&query=${geoQuery}`);
  if (geoResult.cod || !geoResult.length) throw new Error("City not found");
  geoData = geoResult;

  const { lat, lon } = geoData[0];

  // 2. Current Weather
  const weatherQuery = `lat=${lat}&lon=${lon}&units=${unit}`;
  currentWeather = await fetchAPI(`${PROXY_URL}?endpoint=/data/2.5/weather&query=${weatherQuery}`);

  // 3. Forecast
  const forecastQuery = `lat=${lat}&lon=${lon}&units=${unit}`;
  forecast = await fetchAPI(`${PROXY_URL}?endpoint=/data/2.5/forecast&query=${forecastQuery}`);

  // 4. AQI
  const aqiQuery = `lat=${lat}&lon=${lon}`;
  const aqiRes = await fetch(`${PROXY_URL}?endpoint=/data/2.5/air_pollution&query=${aqiQuery}`);
  aqiData = aqiRes.ok ? await aqiRes.json() : null;
}
  const tempSymbol = unit === "metric" ? "C" : "F";
  const windSymbol = unit === "metric" ? "m/s" : "mph";
  const { name: cityName, country } = geoData[0];

  const hourlyData = parseHourlyData(forecast.list || [], tempSymbol);
  const dailyData = parseDailyData(forecast.list || [], tempSymbol);

  const finalData = {
    currentTemp: currentWeather.main.temp,
    feelsLike: currentWeather.main.feels_like,
    city: cityName,
    country,
    condition: currentWeather.weather[0].description,
    icon: currentWeather.weather[0].icon,
    humidity: currentWeather.main.humidity,
    pressure: currentWeather.main.pressure || "N/A",
    windSpeed: currentWeather.wind.speed,
    windDirection: currentWeather.wind.deg,
    clouds: currentWeather.clouds.all,
    timestamp: currentWeather.dt,
    sunrise: currentWeather.sys.sunrise,
    sunset: currentWeather.sys.sunset,
    timezone: currentWeather.timezone,
    visibility: currentWeather.visibility || "N/A",
    precipitation_current: (currentWeather.rain?.['1h'] || 0) + (currentWeather.snow?.['1h'] || 0),
    units: { temp: tempSymbol, wind: windSymbol },
    fetchedAt: Date.now(),
    hourlyData,
    dailyData,
    aqi: {
      value: aqiData?.list?.[0]?.main?.aqi ?? null,
      label: ["Unknown", "Good", "Fair", "Moderate", "Poor", "Very Poor"][
        aqiData?.list?.[0]?.main?.aqi ?? 0
      ] || "Unknown",
      components: aqiData?.list?.[0]?.components || {}
    }
  };

  setCachedData(cacheKey, finalData);
  console.log("Fetched new data:", city, unit);
  return finalData;
}


async function showWeather(city, unit, forceRefresh = false) {
  if (!city || typeof city !== 'string' || city.trim() === '') {
    alert("Please enter a city.");
    return;
  }
  let currentLastCity = city.trim();
  localStorage.setItem("lastCity", currentLastCity);

  try {
    showLoader();
    const data = await getWeather(city, unit, forceRefresh);

    const sunriseTms = data.sunrise ? data.sunrise * 1000 : 0;
    const sunsetTms = data.sunset ? data.sunset * 1000 : 0;
    const currentTime = Date.now();
    const totalDaylightDuration = (sunriseTms && sunsetTms && sunsetTms > sunriseTms) ? (sunsetTms - sunriseTms) : 0;

    let sunPositionPercent = 0;
    if (totalDaylightDuration > 0 && currentTime >= sunriseTms && currentTime <= sunsetTms) {
      sunPositionPercent = (currentTime - sunriseTms) / totalDaylightDuration;
    } else if (currentTime > sunsetTms && totalDaylightDuration > 0) {
      sunPositionPercent = 1;
    } else {
      sunPositionPercent = 0;
    }
    sunPositionPercent = Math.max(0, Math.min(1, sunPositionPercent));

    const arcRadius = 50, arcCenterX = 60, arcCenterY = 60, sunIconRadius = 6;
    const angle = Math.PI - (sunPositionPercent * Math.PI);
    const sunX = arcCenterX + arcRadius * Math.cos(angle);
    const sunY = arcCenterY - arcRadius * Math.sin(angle);
    const sunriseTimeText = formatTimeWithOffset(data.sunrise, data.timezone);
    const sunsetTimeText = formatTimeWithOffset(data.sunset, data.timezone);
    content.innerHTML = `
<div class="last-updated">
        <span><md-icon class="material-symbols-outlined icon">schedule</md-icon> ${relativeTime(data.fetchedAt)}</span>
        <p class="location">${data.city || 'N/A'}${data.country ? ', ' + data.country : ''}</p>
      </div>

<div id="currentTemp">
        <p class="mainTemp">${Math.round(data.currentTemp)}°<sup>${data.units.temp}</sup></p>
  <div class="info">
        <img src="${getCustomIcon(data.icon)}" alt="${data.condition}" width="60">    
    <p>${data.condition}</p>
  </div>
      </div>
<div id="bg"></div>
<div class="other">
<md-ripple></md-ripple>
  <div class="info-item"><span><span class="material-symbols-outlined">thermostat</span> Feels Like:</span><span>${Math.round(data.feelsLike)}°${data.units.temp}</span></div>
  <div class="info-item"><span><span class="material-symbols-outlined">compress</span> Pressure:</span><span>${data.pressure} hPa</span></div>
  <div class="info-item"><span><span class="material-symbols-outlined">filter_drama</span> Clouds:</span><span>${data.clouds}%</span></div>
  <div class="info-item"><span><span class="material-symbols-outlined">water_drop</span> Humidity:</span><span>${data.humidity}%</span></div>
<div class="info-item"><span><span class="material-symbols-outlined">grain</span> Precipitation:</span><span>${data.precipitation_current !== undefined && data.precipitation_current !== null ? data.precipitation_current + ' mm' : (data.hourlyData && data.hourlyData[0] && data.hourlyData[0].precipitation_probability !== null ? data.hourlyData[0].precipitation_probability + '%' : 'N/A')}</span></div>
      </div>

<h3>Wind Speed</h3>
<div class="windContainer"> <div class="windWrap">
<md-ripple></md-ripple>
<h2 class="currentWind">${data.windSpeed} ${data.units.wind}</h2>
<p>${degToDir(data.windDirection)}</p>
</div>
<div class="windForecast">
${(data.hourlyData || []).map(entry => `<div class="hour-wind"><span>${entry.time}</span><p>
       ${entry.wind_speed} ${data.units.wind}
      </p></div>`).join('')}
</div>
</div>
      <md-divider></md-divider>

<h3>Hourly Forecast</h3>
      <div class="hourly-container">
        <ul class="hourly">
          ${(data.hourlyData || []).map(entry => `
            <li class="hourly-card">
              <p class="hour-time">${entry.time}</p>
              <p class="hourTemp">${entry.temp}°${entry.tempUnitSymbol || tempUnitDisplay}</p>
<div class="hour-img">
              <img src="${getCustomIcon(entry.icon)}" alt="${entry.weather}" class="hour-icon">
              <p class="hour-precip"><span class="material-symbols-outlined">
water_drop
</span> ${entry.precipitation_probability !== null ? entry.precipitation_probability + '%' : (entry.precipitation_amount !== null ? entry.precipitation_amount + 'mm' : 'N/A')}</p>
</div>
            </li>
          `).join('') || '<li>No hourly data available</li>'}
        </ul>
      </div>
      <md-divider></md-divider>


<h3>Daily Forecast</h3>
<div class="daily-container">
  <ul class="daily">
    ${(data.dailyData || []).map(e => `
      <li class="daily-card">
        <p class="daily-time">${e.dayName}, ${e.dayOfMonth}/${e.month}</p>
        <p class="dailyTemp">${e.maxTemp}°/ ${e.minTemp}°${e.tempUnitSymbol || 'C'}</p>
<div class="daily-img">
        <img src="${getCustomIcon(e.icon)}" alt="${e.description}" class="daily-icon">
        <p class="daily-precip"><span class="material-symbols-outlined">
water_drop
</span> ${e.precipitation_probability !== null ? e.precipitation_probability + '%' : (e.precipitation_sum !== null ? e.precipitation_sum + 'mm' : 'N/A')}</p>
</div>
      </li>
    `).join('') || '<li>No daily data available</li>'}
  </ul>
</div>
<md-divider></md-divider>

<div class="sun-arc-container">
        <svg viewBox="0 0 120 70" preserveAspectRatio="xMidYMax meet" class="sun-arc-svg">
          <path d="M ${arcCenterX - arcRadius},${arcCenterY} A ${arcRadius},${arcRadius} 0 0,1 ${arcCenterX + arcRadius},${arcCenterY}" fill="none" stroke="var(--sun-arc-color, #FFD700)" stroke-width="1.5" class="sun-arc-path"/>
          <line x1="0" y1="${arcCenterY}" x2="120" y2="${arcCenterY}" stroke="var(--horizon-color, #ccc)" stroke-width="1" />
          <circle cx="${sunX}" cy="${sunY}" r="${sunIconRadius}" fill="var(--sun-icon-color, orange)" class="sun-icon"/>
          <circle cx="${sunX}" cy="${sunY}" r="${sunIconRadius + 2}" fill="var(--sun-icon-color, orange)" opacity="0.2" />
          <text x="${arcCenterX - arcRadius - 5}" y="${arcCenterY + 15}" font-size="10" text-anchor="end" fill="var(--text-color, #333)">${sunriseTimeText}</text>
          <text x="${arcCenterX + arcRadius + 5}" y="${arcCenterY + 15}" font-size="10" text-anchor="start" fill="var(--text-color, #333)">${sunsetTimeText}</text>
        </svg>
<div class="sunData">
<p>↑ <strong>${sunriseTimeText}</strong></p>
<p>↓ <strong>${sunsetTimeText}</strong></p>
        </div>
<div class="sunInfo">
        <p class="daylight">Daylight: ${formatDurationHHMM(totalDaylightDuration)}</p>
        <p class="sunPercent">${Math.floor(sunPositionPercent * 100)}% through day</p>
</div>
      </div>
      <md-divider></md-divider>
<h3>AQI</h3>
<div id="aqiBox">
<md-ripple></md-ripple>
  <div class="aqi-wrap">
    <h1>${data.aqi?.rawValue ?? data.aqi?.value ?? 'N/A'}</h1>
    <span class="aqi-label aqi-text-${data.aqi?.value || 0}">${data.aqi?.label || 'N/A'}</span> 
  </div>

  <div class="aqi-bar-wrapper">
    <div class="aqi-bar" style="width: ${(data.aqi?.value || 1) * 20}%;"></div>
  </div>
  </div>

  <details class="aqi-components-details">
    <summary>Show Pollutant Details
    <span class="material-symbols-outlined arrow-icon">arrow_drop_down</span>
</summary>
    <table class="aqi-components-table">
      <thead><tr><th>Pollutant</th><th>Value (µg/m³)</th></tr></thead>
      <tbody>
        ${Object.entries(data.aqi?.components || {}).map(([k, v]) => `
          <tr><td><strong>${k.replace(/_/g, '.').toUpperCase()}</strong></td><td>${typeof v === 'number' ? v.toFixed(2) : 'N/A'}</td></tr>
        `).join('')}
      </tbody>
    </table>
  </details>
</div>
`;

    const currentTempDiv = content.querySelector('#bg');
    if (currentTempDiv) {
      currentTempDiv.style.setProperty('--current-temp-bg-image', `url('${getBackgroundImage(data.icon)}')`);
    }
    hideMessage();
          if (localStorage.getItem("minimalMode") === "true") {
  minimalMode.selected = true;
  minimal(); 
  }
  } catch (error) {
    console.error("Error fetching weather:", error);
    content.innerHTML = `<p class="warning">Error loading weather data.</p>`;
  }
  finally {
    hideLoader();
  }
}


search.addEventListener("click", async () => {
  const city = citySrc.value.trim();
  const unit = localStorage.getItem("unit") || "metric";
  if (!city) {
    content.innerHTML = `<p class="warning">Please enter a valid city name.</p>`;
    return;
  }
  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      content.innerHTML = `<p class="warning">City not found. Please try again.</p>`;
      return;
    }
    saveCityToLocalStorage(city);
    renderSavedCities();
    showWeather(city, unit);

  } catch (error) {
    console.error("Error validating city:", error);
    content.innerHTML = `<p class="warning">Error checking city. Try again later.</p>`;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const lastCity = localStorage.getItem("lastCity");

  const unit = localStorage.getItem("unit") || "metric";
  if (lastCity) {
    showWeather(lastCity, unit);
  } else {
    console.log('No last city found in local storage.');
    hideLoader();
  }
  renderSavedCities();


document.getElementById("units").addEventListener("change", () => {
  const selectedUnit = document.getElementById("units").value;

  localStorage.setItem("unit", selectedUnit);

  const cityInput = document.getElementById("citySrc");
  const currentCity = cityInput.value.trim();

  if (currentCity) {
    showWeather(currentCity, selectedUnit, true);
  } else {
    let lastCity = localStorage.getItem("lastCity");
    showWeather(lastCity, selectedUnit, true);
  }
});


refresh.addEventListener("click", () => {
  const city = localStorage.getItem("lastCity") || citySrc.value.trim();
  const unit = localStorage.getItem("unit") || "metric";
  if (city) {
    showWeather(city, unit, true);
  }
});

const closeSaved = document.getElementsByClassName("close")[0];
const close = document.getElementsByClassName("close")[1];
close.addEventListener('click', () => { hideDiv("settings") })
closeSaved.addEventListener('click', () => { hideDiv("savedCities") })


const showSettingsButton = document.getElementById('setting');
  const savedLocationButton = document.getElementById('location');
  
  if (showSettingsButton) {
    showSettingsButton.addEventListener('click', () => {
      showDiv('settings');
    });
  }
  
  if (savedLocationButton) {
    savedLocationButton.addEventListener('click', () => {
      showDiv("savedCities");
    });
  }
  let sCity = getSavedCities();
  if(!lastCity && sCity.length === 0) {
    showMessage();
    } else {
    hideMessage();
  }

});

setInterval(() => {
const cityToRefresh = localStorage.getItem("lastCity");
const unit = localStorage.getItem("unit") || "metric";
  if (currentLastCity) showWeather(cityToRefresh ,unit, true);
}, 1 * 60 * 60 * 1000);

function showDiv(div) {
  document.getElementById(div).style.display = "block";
  document.body.classList.add("no-scroll");
}
function hideDiv(div) {
  document.getElementById(div).style.display = "none";
  document.body.classList.remove("no-scroll");
}

// Load saved cities from localStorage
function getSavedCities() {
  return JSON.parse(localStorage.getItem("savedCities") || "[]");
}

// Save updated list to localStorage
function saveCityToLocalStorage(city) {
  const cities = getSavedCities();
  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem("savedCities", JSON.stringify(cities));
  }
}
async function renderSavedCities() {
  const list    = document.getElementById("savedCitiesList");
  const message = document.getElementById("smessage");
  const cities  = getSavedCities();

  message.style.display = cities.length ? "none" : "block";

  const cityWithWeather = await Promise.all(
    cities.map(async city => {
      try {
        const data = await getWeather(city, "metric");
        return {
          city, 
          icon: data?.icon ? getCustomIcon(data.icon) : '/icons/default.svg',
          condition: data.condition
        };
      } catch (e) {
        return { city, icon: '/icons/default.svg' };
      }
    })
  );

  list.innerHTML = cityWithWeather.map(({ city, icon, condition }) => `
    <li class="saved-city-item">
      <md-ripple></md-ripple>
      <span data-city="${city}">
        <img src="${icon}" alt="${condition}" title="${condition}" class="saved-city-icon" width="25">
        ${city}
      </span>
      <button class="remove-city" title="Remove" data-city="${city}">
        <span class="material-symbols-outlined">delete_outline</span>
      </button>
    </li>
  `).join("");

  list.onclick = e => {
    const span = e.target.closest("span[data-city]");
    if (span) {
      const city = span.dataset.city;
      const unit = localStorage.getItem("unit") || "metric";
      showWeather(city, unit);
      if (getDeviceType() === "mobile") hideDiv("savedCities");
      citySrc.value = city;
      return;
    }

    const removeBtn = e.target.closest(".remove-city");
    if (removeBtn) {
      const cityToRemove = removeBtn.dataset.city;
      const updated = getSavedCities().filter(c => c !== cityToRemove);
      localStorage.setItem("savedCities", JSON.stringify(updated));
      renderSavedCities(); // re‐render
    }
  };
}

document.getElementById("getLocationBtn").addEventListener("click", () => {
  const btn = document.getElementById("getLocationBtn");
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<span class="material-symbols-outlined">loop</span> Getting location...`;

  if (!navigator.geolocation) {
    alert("Geolocation not supported by your browser.");
    btn.innerHTML = originalHTML;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const userApiKey = localStorage.getItem("userApiKey");
        let reverseGeocodeUrl;
        if (userApiKey) {
          console.log("Reverse geocoding using user's key.");
          reverseGeocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${userApiKey}`;
        } else {
          console.log("Reverse geocoding using default key via proxy.");
          const endpoint = '/geo/1.0/reverse';
          const query = `lat=${lat}&lon=${lon}&limit=1`;
          reverseGeocodeUrl = `/.netlify/functions/openweather?endpoint=${encodeURIComponent(endpoint)}&query=${encodeURIComponent(query)}`;
        }
        const res = await fetch(reverseGeocodeUrl);
        if (!res.ok) throw new Error("Geocoding failed");
        const data = await res.json();
        if (data.cod || !data.length) throw new Error("No city found for your coordinates");

        const city = data[0].name;
        
        document.getElementById("citySrc").value = city;
        saveCityToLocalStorage(city); // Assuming you have this function
        renderSavedCities();
        await showWeather(city); // Assuming showWeather calls your main getWeather function
        
        btn.innerHTML = originalHTML;
      } catch (error) {
        console.error(error);
        alert(error.message);
        btn.innerHTML = originalHTML;
      }
    },
    (error) => {
      console.error("Geolocation error:", error);
      let msg = "Unknown error";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          msg = "Location permission denied";
          break;
        case error.POSITION_UNAVAILABLE:
          msg = "Location unavailable";
          break;
        case error.TIMEOUT:
          msg = "Location request timed out";
          break;
      }
      alert(msg);
      btn.innerHTML = originalHTML;
    },
    {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 0
    }
  );
});

function showLoader() {
  const loader = document.getElementById("loader-overlay");
  if (loader) loader.style.display = "flex";
}

function hideLoader() {
  const loader = document.getElementById("loader-overlay");
  if (loader) loader.style.display = "none";
}
const deviceType = getDeviceType();
window.addEventListener("DOMContentLoaded", () => {
  if(deviceType === "tablet" || deviceType === "desktop") {
    document.getElementById("location-item").style.display = "none";
  }
  const savedUnit = localStorage.getItem("unit") || "metric";
  document.getElementById("units").value = savedUnit;


});

function minimal() {
  const currentTempDiv = content.querySelector('#bg');
  if (currentTempDiv) {
    currentTempDiv.style.display = "none";
  }
const city = localStorage.getItem("lastCity").toLowerCase() || null;  // or however you're tracking it
  const units = "metric"; // or get from current settings
  const storageKey = `owm_weather_${city}_${units}`;

  const weatherDataStr = localStorage.getItem(storageKey);
  if (weatherDataStr) {
    try {
      const weatherData = JSON.parse(weatherDataStr);
      const sunrise = weatherData.data.sunrise * 1000;
      const sunset  = weatherData.data.sunset  * 1000;
      const now = Date.now();

      const percent = Math.max(0, Math.min(100, ((now - sunrise) / (sunset - sunrise)) * 100));

      const currentTemp = document.getElementById("currentTemp");
      if (currentTemp) {
        currentTemp.insertAdjacentHTML("afterend", `
          <div id="minimalDayBar" style="margin: auto; width: 90%;">
            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); text-align: center; margin-bottom: 8px;">
              ${Math.floor(percent)}% day
            </div>
            <div style="background-color: var(--md-sys-color-surface-variant); height: 8px; border-radius: 4px; overflow: hidden; width: 100%;">
              <div style="width: ${percent}%; height: 100%; background: var(--md-sys-color-on-surface-variant); transition: width 0.4s ease;"></div>
            </div>
          </div>
        `);
      }
    } catch (e) {
      console.warn("Error parsing weather data for city:", city, e);
    }
  }
  const elementsToHide = [
    ".last-updated",
    ".sun-arc-container",
    ".windForecast",
    ".daily-container",
    ".aqi-components-details"
  ];
  elementsToHide.forEach(sel => {
    const el = content.querySelector(sel);
    if (el) el.style.display = "none";
  });

  const mainTemp = content.querySelector(".mainTemp");
  if (mainTemp) {
    mainTemp.removeAttribute('style');
    mainTemp.classList.add("mMainTemp");
  }

const currentTemp = document.getElementById("currentTemp");
if (currentTemp) {
    currentTemp.style.justifyContent = "center";
}
  

  [...content.getElementsByClassName("info")].forEach(div => div.style.display = "none");

  const headings = content.querySelectorAll("h3");
  if (headings.length >= 2) {
    headings[headings.length - 2].style.display = "none";
  }
  headings.forEach(h => h.classList.add("mh3"));

  content.querySelectorAll(".hourly-card").forEach(e => e.classList.add("mHourly"));
  content.querySelectorAll(".hour-precip").forEach(e => e.style.display = "none");

  const other = content.querySelector(".other");
  if (other) other.classList.add("mOther");
}

const minimalMode = document.getElementById("minimalMode");
minimalMode.addEventListener("change" , () => {
  const enabled = minimalMode.selected;
  localStorage.setItem("minimalMode", enabled);
  if (enabled) {
    console.log("on")
    minimal();
  } else {
    console.log("off")
    location.reload();
  }
})


document.getElementById("checkApi").addEventListener("click", async () => {
  const input = document.getElementById("apiInput");
  const key = input.value.trim();

  if (!key) {
    alert("Please enter an API key.");
    return;
  }

  const testCity = "London";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${testCity}&appid=${key}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }
    const data = await res.json();
    if (data.cod !== 200) {
      throw new Error("Invalid API response");
    }

    localStorage.setItem("userApiKey", key);
    alert("API key saved successfully!");

  } catch (e) {
    alert("Failed to validate API key. Please check and try again.");
    console.warn(e);
  }
});
