function fmtTime(iso) {
  if (!iso) return '--:--';
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

async function getWeather(city) {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
    console.log('Geo URL:', geoUrl);
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error(`Erro na geocodificação: ${geoResponse.status}`);
    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) throw new Error('Cidade não encontrada');

    const { latitude, longitude, name, country } = geoData.results[0];
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Coordenadas inválidas para a cidade');
    }

    // Monta URL do forecast (removendo daily=pressure_msl e adicionando hourly=pressure_msl) e aplica fallback de timezone
    let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,weathercode,pressure_msl&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,sunrise,sunset&timezone=auto`;
    console.log('Weather URL:', weatherUrl);
    let weatherResponse = await fetch(weatherUrl);
    if (weatherResponse.status === 400) {
      const fallbackUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,weathercode,pressure_msl&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,sunrise,sunset&timezone=UTC`;
      const fallbackResponse = await fetch(fallbackUrl);
      if (fallbackResponse.ok) {
        weatherUrl = fallbackUrl;
        weatherResponse = fallbackResponse;
      }
    }
    if (!weatherResponse.ok) throw new Error(`Erro ao buscar dados do clima: ${weatherResponse.status} (URL: ${weatherUrl})`);

    const w = await weatherResponse.json();
    return {
      location: `${name}${country ? ', ' + country : ''}`,
      current: {
        temperature: w.current_weather.temperature,
        weathercode: w.current_weather.weathercode,
        windspeed: w.current_weather.windspeed,
        time: w.current_weather.time
      },
      hourly: {
        time: w.hourly.time,
        temperature: w.hourly.temperature_2m,
        code: w.hourly.weathercode,
        humidity: w.hourly.relativehumidity_2m,
        pressure: w.hourly.pressure_msl
      },
      daily: w.daily
    };
  } catch (error) {
    throw new Error(`Erro ao obter dados para ${city}: ${error.message}`);
  }
}

function getWeatherDescription(code) {
  const descriptions = {
    0: 'Céu limpo', 1: 'Principalmente limpo', 2: 'Parcialmente nublado', 3: 'Nublado',
    45: 'Névoa', 48: 'Névoa com geada', 51: 'Garoa leve', 53: 'Garoa moderada', 55: 'Garoa intensa',
    56: 'Garoa congelante leve', 57: 'Garoa congelante intensa', 61: 'Chuva leve', 63: 'Chuva moderada', 65: 'Chuva forte',
    66: 'Chuva congelante leve', 67: 'Chuva congelante forte', 71: 'Neve leve', 73: 'Neve moderada', 75: 'Neve forte',
    77: 'Grãos de neve', 80: 'Chuva leve', 81: 'Chuva moderada', 82: 'Chuva forte', 85: 'Neve leve', 86: 'Neve forte',
    95: 'Tempestade', 96: 'Tempestade com granizo leve', 99: 'Tempestade com granizo forte'
  };
  return descriptions[code] || 'Desconhecido';
}

function getWeatherIcon(code) {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 85 && code <= 86) return '❄️';
  if (code >= 95) return '⛈️';
  return '☀️';
}

function buildHoursStrip(hourly) {
  const strip = document.getElementById('hoursStrip');
  strip.innerHTML = '';
  if (!hourly || !hourly.time) return;
  const today = new Date().toISOString().slice(0,10);
  const indices = hourly.time.map((t, idx) => ({ t, idx })).filter(({ t }) => t.startsWith(today));
  const picks = [0, 3, 6, 9, 12, 15, 18, 21].map(h => {
    const found = indices.find(({ t }) => new Date(t).getHours() === h);
    return found ? found.idx : null;
  }).filter(i => i !== null);
  picks.forEach(i => {
    const dt = new Date(hourly.time[i]);
    const card = document.createElement('div');
    card.className = 'hour-card';
    card.innerHTML = `
      <div class="h">${dt.toLocaleTimeString('pt-BR',{hour:'2-digit', minute:'2-digit'})}</div>
      <div class="ic">${getWeatherIcon(hourly.code[i])}</div>
      <div class="t">${Math.round(hourly.temperature[i])}°</div>
    `;
    strip.appendChild(card);
  });
}

function buildDaily(daily) {
  const forecastContainer = document.getElementById('forecastContainer');
  forecastContainer.innerHTML = '';
  if (!daily || !daily.time) return;
  for (let i = 0; i < Math.min(7, daily.time.length); i++) {
    const date = daily.time[i];
    const maxTemp = daily.temperature_2m_max[i];
    const minTemp = daily.temperature_2m_min[i];
    const dayCode = daily.weathercode[i];
    const dayWind = daily.windspeed_10m_max[i];
    const dayName = new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' });
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.innerHTML = `
      <div class="day">${dayName}</div>
      <div class="icon">${getWeatherIcon(dayCode)}</div>
      <div class="temp">${Math.round(maxTemp)}° / ${Math.round(minTemp)}°</div>
      <div class="wind">💨 ${Math.round(dayWind)} km/h</div>
    `;
    forecastContainer.appendChild(dayCard);
  }
}

function updateNowBlocks(data) {
  const { location, current, hourly, daily } = data;
  document.getElementById('cityName').textContent = location;
  document.getElementById('weatherIcon').textContent = getWeatherIcon(current.weathercode);
  document.getElementById('temperature').textContent = `${Math.round(current.temperature)}°C`;
  document.getElementById('description').textContent = getWeatherDescription(current.weathercode);
  document.getElementById('windspeed').textContent = Math.round(current.windspeed);
  document.getElementById('humidity').textContent = hourly?.humidity?.[0] ?? '--';
  document.getElementById('datetime').textContent = new Date(current.time).toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  document.getElementById('feelsLike').textContent = `${Math.round(current.temperature)}°`;
  if (daily?.sunrise?.length) document.getElementById('sunrise').textContent = fmtTime(daily.sunrise[0]);
  if (daily?.sunset?.length) document.getElementById('sunset').textContent = fmtTime(daily.sunset[0]);
  if (typeof daily?.precipitation_probability_mean?.[0] !== 'undefined') document.getElementById('precip').textContent = Math.round(daily.precipitation_probability_mean[0]);
  if (typeof hourly?.pressure?.[0] !== 'undefined') document.getElementById('pressure').textContent = Math.round(hourly.pressure[0]);
}

async function onSearch() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) { alert('Por favor, digite o nome da cidade.'); return; }
  try {
    const data = await getWeather(city);
    updateNowBlocks(data);
    buildHoursStrip(data.hourly);
    buildDaily(data.daily);
    document.getElementById('result').classList.remove('hidden');
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('searchButton').addEventListener('click', onSearch);

document.getElementById('cityInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') onSearch();
});
