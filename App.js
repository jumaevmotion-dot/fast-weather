import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions
} from 'react-native';
import * as Location from 'expo-location';
import Svg, { Path, Circle, Defs, RadialGradient, LinearGradient, Stop, G, Ellipse, Rect, Line } from 'react-native-svg';
import { getCurrentWeather, getForecast } from './src/services/weatherApi';
import { getWeatherIcon, formatTime, formatDate, getDayName, getWindDirection } from './src/utils/helpers';
import { DARK_THEME, LIGHT_THEME } from './src/constants/themes';

const { width: W } = Dimensions.get('window');

export default function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lang, setLang] = useState('uz');

  const T = isDark ? DARK_THEME : LIGHT_THEME;

  const fetchWeather = async () => {
    try {
      setError(null);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setError('Joylashuv ruxsati berilmadi'); setLoading(false); return; }
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      const [w, f] = await Promise.all([
        getCurrentWeather(latitude, longitude, lang),
        getForecast(latitude, longitude, lang)
      ]);
      setWeather(w);
      setForecast(f);
    } catch (e) {
      setError('Ma\'lumot yuklanmadi. Internetni tekshiring.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchWeather(); }, [lang]);

  const onRefresh = () => { setRefreshing(true); fetchWeather(); };

  if (loading) return (
    <View style={[s.center, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />
      <ActivityIndicator size="large" color={T.accent} />
      <Text style={[s.loadingText, { color: T.muted }]}>Joylashuv aniqlanmoqda...</Text>
    </View>
  );

  if (error) return (
    <View style={[s.center, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />
      <Text style={{ color: T.muted, fontSize: 16, textAlign: 'center', marginBottom: 20 }}>{error}</Text>
      <TouchableOpacity style={[s.retryBtn, { backgroundColor: T.accent }]} onPress={() => { setLoading(true); fetchWeather(); }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Qayta urinish</Text>
      </TouchableOpacity>
    </View>
  );

  const hourly = forecast?.list?.slice(0, 8) || [];
  const daily = (() => {
    if (!forecast?.list) return [];
    const days = {};
    forecast.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!days[date]) days[date] = item;
    });
    return Object.values(days).slice(0, 7);
  })();

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={[s.city, { color: T.text }]}>{weather?.name}, {weather?.sys?.country}</Text>
            <Text style={[s.date, { color: T.muted }]}>{formatDate(new Date(), lang)}</Text>
          </View>
          <View style={s.headerRight}>
            {/* Lang switcher */}
            <View style={s.langRow}>
              {['uz', 'ru', 'en'].map(l => (
                <TouchableOpacity key={l} onPress={() => setLang(l)}
                  style={[s.langBtn, { backgroundColor: lang === l ? T.accent : T.card }]}>
                  <Text style={{ color: lang === l ? '#fff' : T.muted, fontSize: 11, fontWeight: '700' }}>{l.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Theme toggle */}
            <TouchableOpacity onPress={() => setIsDark(!isDark)} style={[s.themeBtn, { backgroundColor: T.card }]}>
              {isDark ? <MoonIcon color={T.accent} /> : <SunIconSmall color={T.accent} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Weather */}
        <View style={[s.currentCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <View style={s.currentTop}>
            <View>
              <Text style={[s.temp, { color: T.text }]}>{Math.round(weather?.main?.temp)}°</Text>
              <Text style={[s.feelsLike, { color: T.muted }]}>
                {lang === 'uz' ? 'His qilinadi' : lang === 'ru' ? 'Ощущается' : 'Feels like'} {Math.round(weather?.main?.feels_like)}°
              </Text>
              <Text style={[s.desc, { color: T.accent }]}>{weather?.weather?.[0]?.description}</Text>
            </View>
            <WeatherIconLarge code={weather?.weather?.[0]?.icon} />
          </View>

          {/* Min/Max */}
          <View style={[s.minMaxRow, { borderTopColor: T.border }]}>
            <Text style={[s.minMax, { color: T.muted }]}>
              ↓ {Math.round(weather?.main?.temp_min)}°
            </Text>
            <Text style={[s.minMax, { color: T.muted }]}>
              ↑ {Math.round(weather?.main?.temp_max)}°
            </Text>
          </View>
        </View>

        {/* Hourly Forecast */}
        <Text style={[s.sectionTitle, { color: T.text }]}>
          {lang === 'uz' ? 'Soatlik bashorat' : lang === 'ru' ? 'По часам' : 'Hourly'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hourlyScroll}>
          {hourly.map((item, i) => (
            <View key={i} style={[s.hourlyCard, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[s.hourlyTime, { color: T.muted }]}>
                {i === 0 ? (lang === 'uz' ? 'Hozir' : lang === 'ru' ? 'Сейчас' : 'Now') : formatTime(item.dt)}
              </Text>
              <WeatherIconSmall code={item.weather?.[0]?.icon} />
              <Text style={[s.hourlyTemp, { color: T.text }]}>{Math.round(item.main.temp)}°</Text>
              <Text style={[s.hourlyRain, { color: T.accent }]}>
                {Math.round((item.pop || 0) * 100)}%
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Daily Forecast */}
        <Text style={[s.sectionTitle, { color: T.text }]}>
          {lang === 'uz' ? '7 kunlik bashorat' : lang === 'ru' ? 'На неделю' : '7-Day Forecast'}
        </Text>
        <View style={[s.dailyCard, { backgroundColor: T.card, borderColor: T.border }]}>
          {daily.map((item, i) => (
            <View key={i} style={[s.dailyRow, { borderBottomColor: i < daily.length - 1 ? T.border : 'transparent' }]}>
              <Text style={[s.dayName, { color: T.text }]}>{i === 0 ? (lang === 'uz' ? 'Bugun' : lang === 'ru' ? 'Сегодня' : 'Today') : getDayName(item.dt, lang)}</Text>
              <WeatherIconSmall code={item.weather?.[0]?.icon} />
              <Text style={[s.dailyRain, { color: T.accent }]}>{Math.round((item.pop || 0) * 100)}%</Text>
              <Text style={[s.dailyTemp, { color: T.muted }]}>{Math.round(item.main.temp_min)}°</Text>
              <View style={[s.tempBar, { backgroundColor: T.border }]}>
                <View style={[s.tempBarFill, { backgroundColor: T.accent, width: `${Math.min(Math.round(item.main.temp_max / 50 * 100), 100)}%` }]} />
              </View>
              <Text style={[s.dailyTemp, { color: T.text }]}>{Math.round(item.main.temp_max)}°</Text>
            </View>
          ))}
        </View>

        {/* Details */}
        <Text style={[s.sectionTitle, { color: T.text }]}>
          {lang === 'uz' ? 'Batafsil' : lang === 'ru' ? 'Подробнее' : 'Details'}
        </Text>
        <View style={s.detailsGrid}>
          {[
            { icon: <RainIcon color={T.accent} />, label: lang === 'uz' ? "Yog'ingarchilik" : lang === 'ru' ? 'Осадки' : 'Precipitation', value: `${Math.round((forecast?.list?.[0]?.pop || 0) * 100)}%` },
            { icon: <WindIcon color={T.accent} />, label: lang === 'uz' ? 'Shamol' : lang === 'ru' ? 'Ветер' : 'Wind', value: `${Math.round(weather?.wind?.speed)} m/s ${getWindDirection(weather?.wind?.deg, lang)}` },
            { icon: <HumidityIcon color={T.accent} />, label: lang === 'uz' ? 'Namlik' : lang === 'ru' ? 'Влажность' : 'Humidity', value: `${weather?.main?.humidity}%` },
            { icon: <PressureIcon color={T.accent} />, label: lang === 'uz' ? 'Bosim' : lang === 'ru' ? 'Давление' : 'Pressure', value: `${weather?.main?.pressure} hPa` },
            { icon: <VisibilityIcon color={T.accent} />, label: lang === 'uz' ? 'Ko\'rinish' : lang === 'ru' ? 'Видимость' : 'Visibility', value: `${(weather?.visibility || 0) / 1000} km` },
            { icon: <SunriseIcon color={T.accent} />, label: lang === 'uz' ? 'Quyosh chiqishi' : lang === 'ru' ? 'Восход' : 'Sunrise', value: formatTime(weather?.sys?.sunrise) },
          ].map((item, i) => (
            <View key={i} style={[s.detailCard, { backgroundColor: T.card, borderColor: T.border }]}>
              {item.icon}
              <Text style={[s.detailLabel, { color: T.muted }]}>{item.label}</Text>
              <Text style={[s.detailValue, { color: T.text }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// ─── SVG ICONS ───────────────────────────────────────────────

function WeatherIconLarge({ code }) {
  const isNight = code?.includes('n');
  if (!code) return null;
  const c = code?.replace('n', 'd');
  return (
    <Svg width={90} height={90} viewBox="0 0 100 100">
      {c === '01d' && <SunSVG size={90} />}
      {c === '02d' && <PartlyCloudySVG size={90} />}
      {(c === '03d' || c === '04d') && <CloudySVG size={90} />}
      {(c === '09d' || c === '10d') && <RainSVG size={90} />}
      {c === '11d' && <ThunderSVG size={90} />}
      {c === '13d' && <SnowSVG size={90} />}
      {c === '50d' && <FogSVG size={90} />}
    </Svg>
  );
}

function WeatherIconSmall({ code }) {
  if (!code) return null;
  const c = code?.replace('n', 'd');
  return (
    <Svg width={32} height={32} viewBox="0 0 100 100">
      {c === '01d' && <SunSVG size={32} />}
      {c === '02d' && <PartlyCloudySVG size={32} />}
      {(c === '03d' || c === '04d') && <CloudySVG size={32} />}
      {(c === '09d' || c === '10d') && <RainSVG size={32} />}
      {c === '11d' && <ThunderSVG size={32} />}
      {c === '13d' && <SnowSVG size={32} />}
      {c === '50d' && <FogSVG size={32} />}
    </Svg>
  );
}

function SunSVG() {
  return (
    <G>
      <Circle cx="50" cy="50" r="22" fill="#FFD700" />
      <Circle cx="50" cy="50" r="18" fill="#FFA500" />
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const rad = angle * Math.PI / 180;
        return <Line key={i} x1={50 + 26 * Math.cos(rad)} y1={50 + 26 * Math.sin(rad)}
          x2={50 + 34 * Math.cos(rad)} y2={50 + 34 * Math.sin(rad)}
          stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />;
      })}
    </G>
  );
}

function PartlyCloudySVG() {
  return (
    <G>
      <Circle cx="38" cy="38" r="16" fill="#FFD700" />
      {[0,60,120,180,240,300].map((angle, i) => {
        const rad = angle * Math.PI / 180;
        return <Line key={i} x1={38 + 20 * Math.cos(rad)} y1={38 + 20 * Math.sin(rad)}
          x2={38 + 26 * Math.cos(rad)} y2={38 + 26 * Math.sin(rad)}
          stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />;
      })}
      <Ellipse cx="58" cy="62" rx="28" ry="16" fill="white" opacity={0.95} />
      <Ellipse cx="44" cy="60" rx="18" ry="14" fill="white" opacity={0.95} />
      <Ellipse cx="68" cy="64" rx="16" ry="12" fill="white" opacity={0.95} />
    </G>
  );
}

function CloudySVG() {
  return (
    <G>
      <Ellipse cx="50" cy="58" rx="32" ry="18" fill="#B0BEC5" />
      <Ellipse cx="36" cy="52" rx="22" ry="16" fill="#CFD8DC" />
      <Ellipse cx="62" cy="54" rx="20" ry="14" fill="#B0BEC5" />
      <Ellipse cx="50" cy="46" rx="18" ry="14" fill="#ECEFF1" />
    </G>
  );
}

function RainSVG() {
  return (
    <G>
      <Ellipse cx="50" cy="45" rx="30" ry="17" fill="#78909C" />
      <Ellipse cx="36" cy="40" rx="20" ry="14" fill="#90A4AE" />
      <Ellipse cx="62" cy="42" rx="18" ry="12" fill="#78909C" />
      <Line x1="35" y1="65" x2="30" y2="78" stroke="#64B5F6" strokeWidth="3.5" strokeLinecap="round" />
      <Line x1="50" y1="65" x2="45" y2="78" stroke="#64B5F6" strokeWidth="3.5" strokeLinecap="round" />
      <Line x1="65" y1="65" x2="60" y2="78" stroke="#64B5F6" strokeWidth="3.5" strokeLinecap="round" />
      <Line x1="42" y1="72" x2="37" y2="85" stroke="#42A5F5" strokeWidth="3" strokeLinecap="round" />
      <Line x1="57" y1="72" x2="52" y2="85" stroke="#42A5F5" strokeWidth="3" strokeLinecap="round" />
    </G>
  );
}

function ThunderSVG() {
  return (
    <G>
      <Ellipse cx="50" cy="38" rx="30" ry="17" fill="#546E7A" />
      <Ellipse cx="36" cy="33" rx="20" ry="14" fill="#607D8B" />
      <Path d="M55 52 L44 68 L52 68 L40 85 L58 65 L50 65 Z" fill="#FFD600" />
    </G>
  );
}

function SnowSVG() {
  return (
    <G>
      <Ellipse cx="50" cy="42" rx="30" ry="17" fill="#B0BEC5" />
      <Ellipse cx="36" cy="37" rx="20" ry="14" fill="#CFD8DC" />
      {[[35,65],[50,65],[65,65],[42,75],[57,75]].map(([x, y], i) => (
        <G key={i}>
          <Circle cx={x} cy={y} r={3} fill="#81D4FA" />
          <Line x1={x-6} y1={y} x2={x+6} y2={y} stroke="#81D4FA" strokeWidth="2" />
          <Line x1={x} y1={y-6} x2={x} y2={y+6} stroke="#81D4FA" strokeWidth="2" />
        </G>
      ))}
    </G>
  );
}

function FogSVG() {
  return (
    <G>
      {[30,45,60,75].map((y, i) => (
        <Line key={i} x1={15} y1={y} x2={85} y2={y} stroke="#90A4AE" strokeWidth="5" strokeLinecap="round" opacity={0.6 + i * 0.1} />
      ))}
    </G>
  );
}

function RainIcon({ color }) {
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="8" y1="19" x2="8" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="16" y1="19" x2="16" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>;
}

function WindIcon({ color }) {
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>;
}

function HumidityIcon({ color }) {
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

function PressureIcon({ color }) {
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
    <Path d="M12 7v5l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>;
}

function VisibilityIcon({ color }) {
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="1.5" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
  </Svg>;
}

function SunriseIcon({ color }) {
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M17 18a5 5 0 0 0-10 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="12" y1="2" x2="12" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="4.22" y1="10.22" x2="5.64" y2="11.64" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="1" y1="18" x2="3" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="21" y1="18" x2="23" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="18.36" y1="11.64" x2="19.78" y2="10.22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="23" y1="22" x2="1" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M8 6l4-4 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

function MoonIcon({ color }) {
  return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

function SunIconSmall({ color }) {
  return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" />
    <Line x1="12" y1="1" x2="12" y2="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="12" y1="21" x2="12" y2="23" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="1" y1="12" x2="3" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="21" y1="12" x2="23" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>;
}

const s = StyleSheet.create({
  root: { flex: 1, paddingTop: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 16, fontSize: 14 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, marginBottom: 16 },
  headerRight: { alignItems: 'flex-end', gap: 8 },
  city: { fontSize: 22, fontWeight: '700' },
  date: { fontSize: 13, marginTop: 2 },
  langRow: { flexDirection: 'row', gap: 6 },
  langBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  themeBtn: { padding: 8, borderRadius: 10 },
  currentCard: { marginHorizontal: 16, borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 20 },
  currentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  temp: { fontSize: 72, fontWeight: '200', lineHeight: 76 },
  feelsLike: { fontSize: 13, marginTop: 4 },
  desc: { fontSize: 15, fontWeight: '600', marginTop: 4, textTransform: 'capitalize' },
  minMaxRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  minMax: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginBottom: 10 },
  hourlyScroll: { paddingLeft: 16, marginBottom: 20 },
  hourlyCard: { width: 72, alignItems: 'center', padding: 12, borderRadius: 16, marginRight: 10, borderWidth: 1 },
  hourlyTime: { fontSize: 12, marginBottom: 8 },
  hourlyTemp: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  hourlyRain: { fontSize: 11, marginTop: 4 },
  dailyCard: { marginHorizontal: 16, borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 20 },
  dailyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 8 },
  dayName: { width: 70, fontSize: 14, fontWeight: '600' },
  dailyRain: { width: 36, fontSize: 12, textAlign: 'center' },
  dailyTemp: { fontSize: 14, width: 32, textAlign: 'center' },
  tempBar: { flex: 1, height: 4, borderRadius: 4, overflow: 'hidden' },
  tempBarFill: { height: '100%', borderRadius: 4 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 10 },
  detailCard: { width: (W - 42) / 2, borderRadius: 16, padding: 16, borderWidth: 1, gap: 6 },
  detailLabel: { fontSize: 12 },
  detailValue: { fontSize: 16, fontWeight: '700' },
});
