import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Line, G, Ellipse } from 'react-native-svg';

const { width: W } = Dimensions.get('window');

const DARK = { bg: '#0f1923', card: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.08)', text: '#fff', muted: 'rgba(255,255,255,0.5)', accent: '#4fc3f7' };
const LIGHT = { bg: '#e8f4fd', card: 'rgba(255,255,255,0.85)', border: 'rgba(0,0,0,0.06)', text: '#1a2533', muted: 'rgba(0,0,0,0.45)', accent: '#0277bd' };

const API_KEY = 'SIZNING_API_KEYINGIZ';

const fetchWeather = async (lat, lon, lang, unit) => {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=${lang}`);
  return res.json();
};

const fetchForecast = async (lat, lon, lang, unit) => {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=${lang}`);
  return res.json();
};

function SunSVG() {
  return <G>
    <Circle cx="50" cy="50" r="22" fill="#FFD700" />
    {[0,45,90,135,180,225,270,315].map((a,i) => {
      const r = a*Math.PI/180;
      return <Line key={i} x1={50+26*Math.cos(r)} y1={50+26*Math.sin(r)} x2={50+34*Math.cos(r)} y2={50+34*Math.sin(r)} stroke="#FFD700" strokeWidth="4" strokeLinecap="round"/>;
    })}
  </G>;
}

function PartlyCloudySVG() {
  return <G>
    <Circle cx="38" cy="38" r="15" fill="#FFD700"/>
    {[0,60,120,180,240,300].map((a,i) => {
      const r=a*Math.PI/180;
      return <Line key={i} x1={38+19*Math.cos(r)} y1={38+19*Math.sin(r)} x2={38+25*Math.cos(r)} y2={38+25*Math.sin(r)} stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>;
    })}
    <Ellipse cx="58" cy="62" rx="28" ry="15" fill="white" opacity={0.95}/>
    <Ellipse cx="44" cy="59" rx="18" ry="13" fill="white" opacity={0.95}/>
    <Ellipse cx="68" cy="64" rx="15" ry="11" fill="white" opacity={0.95}/>
  </G>;
}

function CloudySVG() {
  return <G>
    <Ellipse cx="50" cy="58" rx="30" ry="17" fill="#B0BEC5"/>
    <Ellipse cx="36" cy="52" rx="21" ry="15" fill="#CFD8DC"/>
    <Ellipse cx="62" cy="54" rx="19" ry="13" fill="#B0BEC5"/>
    <Ellipse cx="50" cy="46" rx="17" ry="13" fill="#ECEFF1"/>
  </G>;
}

function RainSVG() {
  return <G>
    <Ellipse cx="50" cy="45" rx="29" ry="16" fill="#78909C"/>
    <Ellipse cx="36" cy="40" rx="19" ry="13" fill="#90A4AE"/>
    <Ellipse cx="62" cy="42" rx="17" ry="11" fill="#78909C"/>
    <Line x1="35" y1="64" x2="30" y2="77" stroke="#64B5F6" strokeWidth="3.5" strokeLinecap="round"/>
    <Line x1="50" y1="64" x2="45" y2="77" stroke="#64B5F6" strokeWidth="3.5" strokeLinecap="round"/>
    <Line x1="65" y1="64" x2="60" y2="77" stroke="#64B5F6" strokeWidth="3.5" strokeLinecap="round"/>
  </G>;
}

function ThunderSVG() {
  return <G>
    <Ellipse cx="50" cy="38" rx="29" ry="16" fill="#546E7A"/>
    <Ellipse cx="36" cy="33" rx="19" ry="13" fill="#607D8B"/>
    <Path d="M55 52 L44 68 L52 68 L40 85 L58 65 L50 65 Z" fill="#FFD600"/>
  </G>;
}

function SnowSVG() {
  return <G>
    <Ellipse cx="50" cy="42" rx="29" ry="16" fill="#B0BEC5"/>
    <Ellipse cx="36" cy="37" rx="19" ry="13" fill="#CFD8DC"/>
    {[[35,65],[50,65],[65,65],[42,75],[57,75]].map(([x,y],i)=>(
      <G key={i}>
        <Circle cx={x} cy={y} r={3} fill="#81D4FA"/>
        <Line x1={x-6} y1={y} x2={x+6} y2={y} stroke="#81D4FA" strokeWidth="2"/>
        <Line x1={x} y1={y-6} x2={x} y2={y+6} stroke="#81D4FA" strokeWidth="2"/>
      </G>
    ))}
  </G>;
}

function FogSVG() {
  return <G>
    {[30,45,60,75].map((y,i)=>(
      <Line key={i} x1={15} y1={y} x2={85} y2={y} stroke="#90A4AE" strokeWidth="5" strokeLinecap="round" opacity={0.5+i*0.1}/>
    ))}
  </G>;
}

function WeatherIcon({ code, size = 80 }) {
  const c = code?.replace('n','d') || '01d';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {c==='01d' && <SunSVG/>}
      {c==='02d' && <PartlyCloudySVG/>}
      {(c==='03d'||c==='04d') && <CloudySVG/>}
      {(c==='09d'||c==='10d') && <RainSVG/>}
      {c==='11d' && <ThunderSVG/>}
      {c==='13d' && <SnowSVG/>}
      {c==='50d' && <FogSVG/>}
    </Svg>
  );
}

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getDayName = (ts, lang) => {
  const d = new Date(ts * 1000);
  const loc = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }[lang] || 'en-US';
  return d.toLocaleDateString(loc, { weekday: 'short' });
};

const getWindDir = (deg, lang) => {
  if (deg === undefined) return '';
  const dirs = {
    uz: ['Sh','ShSh',"ShG'",'G\'Sh',"G'",'G\'J','J','JSh'],
    ru: ['С','СВ','В','ЮВ','Ю','ЮЗ','З','СЗ'],
    en: ['N','NE','E','SE','S','SW','W','NW'],
  };
  return (dirs[lang] || dirs.en)[Math.round(deg/45) % 8];
};

export default function HomeScreen({ navigation, route }) {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState('uz');
  const [unit, setUnit] = useState('metric');
  const [windUnit, setWindUnit] = useState('ms');

  const T = isDark ? DARK : LIGHT;

  useEffect(() => { loadSettings(); }, []);

  useEffect(() => {
    const city = route?.params?.city;
    if (city) {
      loadData(city.lat, city.lon);
    } else {
      loadByGPS();
    }
  }, [lang, unit, route?.params?.city]);

  const loadSettings = async () => {
    try {
      const theme = await AsyncStorage.getItem('theme');
      const language = await AsyncStorage.getItem('language');
      const tempUnit = await AsyncStorage.getItem('unit');
      const wUnit = await AsyncStorage.getItem('windUnit');
      if (theme) setIsDark(theme === 'dark');
      if (language) setLang(language);
      if (tempUnit) setUnit(tempUnit);
      if (wUnit) setWindUnit(wUnit);
    } catch {}
  };

  const loadData = async (lat, lon) => {
    try {
      setError(null);
      const [w, f] = await Promise.all([
        fetchWeather(lat, lon, lang, unit),
        fetchForecast(lat, lon, lang, unit),
      ]);
      setWeather(w);
      setForecast(f);
    } catch { setError("Ma'lumot yuklanmadi"); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const loadByGPS = async () => {
    try {
      setError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setError('GPS ruxsati kerak'); setLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await loadData(loc.coords.latitude, loc.coords.longitude);
    } catch { setError("Joylashuv aniqlanmadi"); setLoading(false); setRefreshing(false); }
  };

  const formatWind = (ms) => {
    if (!ms) return '0 m/s';
    if (windUnit === 'kmh') return `${Math.round(ms * 3.6)} km/h`;
    if (windUnit === 'mph') return `${Math.round(ms * 2.237)} mph`;
    return `${Math.round(ms)} m/s`;
  };

  const L = {
    uz: { hourly:'Soatlik', weekly:'7 kunlik', details:'Batafsil', now:'Hozir', today:'Bugun', rain:"Yog'in", wind:'Shamol', humidity:'Namlik', pressure:'Bosim', visibility:"Ko'rinish", sunrise:'Quyosh', feels:'His qilinadi', retry:'Qayta' },
    ru: { hourly:'По часам', weekly:'На неделю', details:'Подробнее', now:'Сейчас', today:'Сегодня', rain:'Осадки', wind:'Ветер', humidity:'Влажность', pressure:'Давление', visibility:'Видимость', sunrise:'Восход', feels:'Ощущается', retry:'Повторить' },
    en: { hourly:'Hourly', weekly:'7-Day', details:'Details', now:'Now', today:'Today', rain:'Rain', wind:'Wind', humidity:'Humidity', pressure:'Pressure', visibility:'Visibility', sunrise:'Sunrise', feels:'Feels like', retry:'Retry' },
  }[lang] || { hourly:'Hourly', weekly:'7-Day', details:'Details', now:'Now', today:'Today', rain:'Rain', wind:'Wind', humidity:'Humidity', pressure:'Pressure', visibility:'Visibility', sunrise:'Sunrise', feels:'Feels like', retry:'Retry' };

  if (loading) return (
    <View style={[s.center, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />
      <ActivityIndicator size="large" color={T.accent} />
    </View>
  );

  if (error) return (
    <View style={[s.center, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={T.bg} />
      <Text style={{ color: T.muted, fontSize: 15, textAlign: 'center', marginBottom: 20 }}>{error}</Text>
      <TouchableOpacity style={[s.retryBtn, { backgroundColor: T.accent }]} onPress={() => { setLoading(true); loadByGPS(); }}>
        <Text style={{ color: '#0f1923', fontWeight: '700' }}>{L.retry}</Text>
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
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadByGPS(); }} tintColor={T.accent} />}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={[s.city, { color: T.text }]}>{weather?.name}, {weather?.sys?.country}</Text>
            <Text style={[s.date, { color: T.muted }]}>{new Date().toLocaleDateString({ uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }[lang] || 'en-US', { weekday:'long', month:'long', day:'numeric' })}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.card, borderColor: T.border }]}
              onPress={() => navigation.navigate('Search', { isDark, lang })}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx="11" cy="11" r="8" stroke={T.text} strokeWidth="2"/>
                <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={T.text} strokeWidth="2" strokeLinecap="round"/>
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.card, borderColor: T.border }]}
              onPress={() => navigation.navigate('Settings')}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="3" stroke={T.text} strokeWidth="1.5"/>
                <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={T.text} strokeWidth="1.5"/>
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current */}
        <View style={[s.currentCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <View style={s.currentTop}>
            <View>
              <Text style={[s.temp, { color: T.text }]}>{Math.round(weather?.main?.temp || 0)}°</Text>
              <Text style={[s.feels, { color: T.muted }]}>{L.feels} {Math.round(weather?.main?.feels_like || 0)}°</Text>
              <Text style={[s.desc, { color: T.accent }]}>{weather?.weather?.[0]?.description || ''}</Text>
            </View>
            <WeatherIcon code={weather?.weather?.[0]?.icon} size={86} />
          </View>
          <View style={[s.minMaxRow, { borderTopColor: T.border }]}>
            <Text style={[s.minMax, { color: T.muted }]}>↓ {Math.round(weather?.main?.temp_min || 0)}°</Text>
            <Text style={[s.minMax, { color: T.muted }]}>↑ {Math.round(weather?.main?.temp_max || 0)}°</Text>
          </View>
        </View>

        {/* Hourly */}
        <Text style={[s.sectionTitle, { color: T.text }]}>{L.hourly}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hourlyScroll}>
          {hourly.map((item, i) => (
            <View key={i} style={[s.hourlyCard, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[s.hourlyTime, { color: T.muted }]}>{i === 0 ? L.now : formatTime(item.dt)}</Text>
              <WeatherIcon code={item.weather?.[0]?.icon} size={30} />
              <Text style={[s.hourlyTemp, { color: T.text }]}>{Math.round(item.main?.temp || 0)}°</Text>
              <Text style={[s.hourlyRain, { color: T.accent }]}>{Math.round((item.pop || 0) * 100)}%</Text>
            </View>
          ))}
        </ScrollView>

        {/* Daily */}
        <Text style={[s.sectionTitle, { color: T.text }]}>{L.weekly}</Text>
        <View style={[s.dailyCard, { backgroundColor: T.card, borderColor: T.border }]}>
          {daily.map((item, i) => (
            <View key={i} style={[s.dailyRow, { borderBottomColor: i < daily.length-1 ? T.border : 'transparent' }]}>
              <Text style={[s.dayName, { color: T.text }]}>{i===0 ? L.today : getDayName(item.dt, lang)}</Text>
              <WeatherIcon code={item.weather?.[0]?.icon} size={28} />
              <Text style={[s.dailyRain, { color: T.accent }]}>{Math.round((item.pop||0)*100)}%</Text>
              <Text style={[s.dailyTemp, { color: T.muted }]}>{Math.round(item.main?.temp_min||0)}°</Text>
              <View style={[s.bar, { backgroundColor: T.border }]}>
                <View style={[s.barFill, { backgroundColor: T.accent, width: `${Math.min(Math.round((item.main?.temp_max||0)/50*100),100)}%` }]} />
              </View>
              <Text style={[s.dailyTemp, { color: T.text }]}>{Math.round(item.main?.temp_max||0)}°</Text>
            </View>
          ))}
        </View>

        {/* Details */}
        <Text style={[s.sectionTitle, { color: T.text }]}>{L.details}</Text>
        <View style={s.grid}>
          {[
            { label: L.rain, value: `${Math.round((forecast?.list?.[0]?.pop||0)*100)}%` },
            { label: L.wind, value: `${formatWind(weather?.wind?.speed)} ${getWindDir(weather?.wind?.deg, lang)}` },
            { label: L.humidity, value: `${weather?.main?.humidity||0}%` },
            { label: L.pressure, value: `${weather?.main?.pressure||0} hPa` },
            { label: L.visibility, value: `${((weather?.visibility||0)/1000).toFixed(1)} km` },
            { label: L.sunrise, value: formatTime(weather?.sys?.sunrise) },
          ].map((item, i) => (
            <View key={i} style={[s.detailCard, { backgroundColor: T.card, borderColor: T.border }]}>
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

const s = StyleSheet.create({
  root: { flex: 1, paddingTop: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, marginBottom: 16 },
  city: { fontSize: 20, fontWeight: '700' },
  date: { fontSize: 12, marginTop: 2 },
  iconBtn: { padding: 10, borderRadius: 12, borderWidth: 1 },
  currentCard: { marginHorizontal: 16, borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 20 },
  currentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  temp: { fontSize: 70, fontWeight: '200', lineHeight: 74 },
  feels: { fontSize: 13, marginTop: 4 },
  desc: { fontSize: 14, fontWeight: '600', marginTop: 4, textTransform: 'capitalize' },
  minMaxRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
  minMax: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', paddingHorizontal: 16, marginBottom: 10 },
  hourlyScroll: { paddingLeft: 16, marginBottom: 20 },
  hourlyCard: { width: 70, alignItems: 'center', padding: 10, borderRadius: 16, marginRight: 10, borderWidth: 1 },
  hourlyTime: { fontSize: 11, marginBottom: 6 },
  hourlyTemp: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  hourlyRain: { fontSize: 10, marginTop: 2 },
  dailyCard: { marginHorizontal: 16, borderRadius: 20, padding: 14, borderWidth: 1, marginBottom: 20 },
  dailyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 8 },
  dayName: { width: 64, fontSize: 13, fontWeight: '600' },
  dailyRain: { width: 32, fontSize: 11, textAlign: 'center' },
  dailyTemp: { fontSize: 13, width: 30, textAlign: 'center' },
  bar: { flex: 1, height: 4, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 10 },
  detailCard: { width: (W-42)/2, borderRadius: 16, padding: 14, borderWidth: 1, gap: 6 },
  detailLabel: { fontSize: 11 },
  detailValue: { fontSize: 15, fontWeight: '700' },
});
