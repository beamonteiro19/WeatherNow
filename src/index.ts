import * as readline from 'readline';
import { getWeather } from './weatherApi';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Digite o nome da cidade: ', async (city) => {
  try {
    const { temperature } = await getWeather(city);
    console.log(`Temperatura em ${city}: ${temperature}°C`);
  } catch (error) {
    console.error('Erro ao buscar dados do clima:', error);
  }
  rl.close();
});