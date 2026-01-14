interface WeatherResult {
  temperature: number;
  weathercode: number;
}

import { getOrSet } from './cache';

export async function getWeather(city: string): Promise<WeatherResult> {
  try {
    // Primeiro, obter coordenadas da cidade (usando a API de geocodificação do Open-Meteo)
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoData = await getOrSet<any>(`geo:${city.toLowerCase()}`, 24 * 60 * 60 * 1000, async () => {
      const resp = await fetch(geoUrl);
      if (!resp.ok) {
        throw new Error(`Erro na geocodificação: ${resp.status}`);
      }
      return resp.json();
    });
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('Cidade não encontrada');
    }
    const { latitude, longitude } = geoData.results[0];
    
    // Buscar dados do clima
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherData = await getOrSet<any>(`weather:${latitude},${longitude}`, 10 * 60 * 1000, async () => {
      const resp = await fetch(weatherUrl);
      if (!resp.ok) {
        throw new Error(`Erro ao buscar dados do clima: ${resp.status}`);
      }
      return resp.json();
    });
    const temperature = weatherData.current_weather.temperature;
    const weathercode = weatherData.current_weather.weathercode;
    
    return { temperature, weathercode };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao obter temperatura para ${city}: ${error.message}`);
    } else {
      throw new Error(`Erro desconhecido ao obter temperatura para ${city}`);
    }
  }
}