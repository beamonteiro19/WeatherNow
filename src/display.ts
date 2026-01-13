interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
  humidity: number;
}

function getWeatherDescription(code: number): string {
  const descriptions: { [key: number]: string } = {
    0: 'Céu limpo',
    1: 'Principalmente limpo',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Névoa',
    48: 'Névoa com geada',
    51: 'Garoa leve',
    53: 'Garoa moderada',
    55: 'Garoa intensa',
    56: 'Garoa congelante leve',
    57: 'Garoa congelante intensa',
    61: 'Chuva leve',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    66: 'Chuva congelante leve',
    67: 'Chuva congelante forte',
    71: 'Neve leve',
    73: 'Neve moderada',
    75: 'Neve forte',
    77: 'Grãos de neve',
    80: 'Chuva leve',
    81: 'Chuva moderada',
    82: 'Chuva forte',
    85: 'Neve leve',
    86: 'Neve forte',
    95: 'Tempestade',
    96: 'Tempestade com granizo leve',
    99: 'Tempestade com granizo forte'
  };
  return descriptions[code] || 'Desconhecido';
}

export function displayWeather(data: WeatherData, city: string): void {
  console.log(`\nClima em ${city}:`);
  console.log(`Temperatura: ${data.temperature}°C`);
  console.log(`Condição: ${getWeatherDescription(data.weathercode)}`);
  console.log(`Velocidade do vento: ${data.windspeed} km/h`);
  console.log(`Umidade: ${data.humidity}%`);
}