import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const API_KEY = 'SIZNING_API_KEYINGIZ';

const DARK = { bg: '#0f1923', card: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.08)', text: '#fff', muted: 'rgba(255,255,255,0.5)', accent: '#4fc3f7' };
const LIGHT = { bg: '#e8f4fd', card: 'rgba(255,255,255,0.85)', border: 'rgba(0,0,0,0.06)', text: '#1a2533', muted: 'rgba(0,0,0,0.45)', accent: '#0277bd' };

export default function SearchScreen({ navigation, route }) {
  const isDark = route?.params?.isDark !== false;
  const lang = route?.params?.lang || 'uz';
  const T = isDark ? DARK : LIGHT;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    loadRecent();
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const loadRecent = async () => {
    try {
      const data = await AsyncStorage.getItem('recent_searches');
      if (data) setRecent(JSON.parse(data));
    } catch {}
  };

  const saveRecent = async (city) => {
    try {
      const updated = [city, ...recent.filter(r => r.name !== city.name)].slice(0, 5);
      await AsyncStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const searchCities = async (text) => {
    setQuery(text);
    if (text.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${text}&limit=5&appid=${API_KEY}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data.map(c => ({ name: c.name, country: c.country, state: c.state || '', lat: c.lat, lon: c.lon })));
      }
    } catch {} finally { setLoading(false); }
  };

  const selectCity = (city) => {
    saveRecent(city);
    Keyboard.dismiss();
    navigation.navigate('Home', { city });
  };

  const L = {
    uz: { placeholder: 'Shahar qidiring...', recent: "So'nggi", noResult: 'Topilmadi', cancel: 'Bekor' },
    ru: { placeholder: 'Поиск города...', recent: 'Последние', noResult: 'Не найдено', cancel: 'Отмена' },
    en: { placeholder: 'Search city...', recent: 'Recent', noResult: 'Not found', cancel: 'Cancel' },
  }[lang] || { placeholder: 'Search...', recent: 'Recent', noResult: 'Not found', cancel: 'Cancel' };

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <View style={s.row}>
        <View style={[s.inputWrap, { backgroundColor: T.card, borderColor: T.border }]}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx="11" cy="11" r="8" stroke={T.muted} strokeWidth="2" />
            <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={T.muted} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <TextInput ref={inputRef} value={query} onChangeText={searchCities}
            placeholder={L.placeholder} placeholderTextColor={T.muted}
            style={[s.input, { color: T.text }]} />
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.cancelBtn}>
          <Text style={[s.cancelTxt, { color: T.accent }]}>{L.cancel}</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color={T.accent} style={{ marginTop: 20 }} />}

      {results.length > 0 && (
        <FlatList data={results} keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selectCity(item)} style={[s.item, { borderBottomColor: T.border }]}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={T.accent} strokeWidth="1.5" />
                <Circle cx="12" cy="10" r="3" stroke={T.accent} strokeWidth="1.5" />
              </Svg>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[s.cityName, { color: T.text }]}>{item.name}</Text>
                <Text style={[s.cityDetail, { color: T.muted }]}>{item.state ? `${item.state}, ` : ''}{item.country}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {results.length === 0 && query.length === 0 && recent.length > 0 && (
        <View>
          <Text style={[s.sectionTitle, { color: T.muted }]}>{L.recent}</Text>
          {recent.map((item, i) => (
            <TouchableOpacity key={i} onPress={() => selectCity(item)} style={[s.item, { borderBottomColor: T.border }]}>
              <Text style={[s.cityName, { color: T.text }]}>{item.name}</Text>
              <Text style={[s.cityDetail, { color: T.muted }]}>{item.country}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {results.length === 0 && query.length > 2 && !loading && (
        <Text style={[s.noResult, { color: T.muted }]}>{L.noResult}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingTop: 56, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 16 },
  cancelBtn: { padding: 8 },
  cancelTxt: { fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  cityName: { fontSize: 16, fontWeight: '600' },
  cityDetail: { fontSize: 12, marginTop: 2 },
  noResult: { textAlign: 'center', marginTop: 40, fontSize: 15 },
});
