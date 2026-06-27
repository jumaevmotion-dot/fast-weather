export const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const formatDate = (date, lang = 'uz') => {
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const locales = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
  return date.toLocaleDateString(locales[lang] || 'uz-UZ', opts);
};

export const getDayName = (timestamp, lang = 'uz') => {
  const date = new Date(timestamp * 1000);
  const locales = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
  return date.toLocaleDateString(locales[lang] || 'uz-UZ', { weekday: 'short' });
};

export const getWindDirection = (deg, lang = 'uz') => {
  if (deg === undefined) return '';
  const dirs = {
    uz: ['Sh', 'ShSh', 'ShG\'', 'G\'Sh', 'G\'', 'G\'J', 'J', 'JSh'],
    ru: ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'],
    en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
  };
  const idx = Math.round(deg / 45) % 8;
  return (dirs[lang] || dirs.uz)[idx];
};
