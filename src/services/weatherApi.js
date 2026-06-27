const API_KEY = '63b32f7ce671f71cd46f78d425ed95b9'; // Bu yerga API keyingizni qo'ying
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const LANG_MAP = { uz: 'uz', ru: 'ru', en: 'en' };

export const getCurrentWeather = async (lat, lon, lang = 'uz') => {
  const res = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${LANG_MAP[lang]}`
  );
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
};

export const getForecast = async (lat, lon, lang = 'uz') => {
  const res = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${LANG_MAP[lang]}`
  );
  if (!res.ok) throw new Error('Forecast fetch failed');
  return res.json();
};
