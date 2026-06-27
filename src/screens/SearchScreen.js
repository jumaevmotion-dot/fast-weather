import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { DARK_THEME, LIGHT_THEME } from '../constants/themes';

const API_KEY = '63b32f7ce671f71cd46f78d425ed95b9';

function SearchIcon({ color }) {
  return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>;
}

function LocationIcon({ color }) {
  return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={color} strokeWidth="1.5" />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.5" />
  </Svg>;
}

function ClockIcon({ color }) {
  return <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
    <Path d="M12 7v5l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>;
}

function CloseIcon({ color }) {
  return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>;
}

export default function SearchScreen({ navigation, route }) {
  const isDark = route.params?.isDark ?? true;
  const lang = route.params?.lang ?? 'uz';
  const T = isDark ? DARK_THEME : LIGHT_THEME;

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
      setRecent(updated);
    } catch {}
  };

  const searchCities = async (text) => {
    setQuery(text);
    if (text.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${text}&limit=5&appid=${API_KEY}`
      );
      const data = await res.json();
      setResults(data.map(c => ({ name: c.name, country: c.country, state: c.state, lat: c.lat, lon: c.lon })));
    } catch {} finally { setLoading(false); }
  };

  const selectCity = (city) => {
    saveRecent(city);
    Keyboard.dismiss();
    navigation.navigate('Home', { city, lang });
  };

  const labels = {
    uz: { placeholder: 'Shahar qidiring...', recent: "So'nggi qidiruvlar", noResult: 'Shahar topilmadi', cancel: 'Bekor' },
    ru: { placeholder: 'Поиск города...', recent: 'Последние', noResult: 'Город не найден', cancel: 'Отмена' },
    en: { placeholder: 'Search city...', recent: 'Recent', noResult: 'City not found', cancel: 'Cancel' },
  };
  const L = labels[lang] || labels.uz;

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      {/* Search bar */}
      <View style={s.searchRow}>
        <View style={[s.inputWrap, { backgroundColor: T.card, borderColor: T.border }]}>
          <SearchIcon color={T.muted} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={searchCities}
            placeholder={L.placeholder}
            placeholderTextColor={T.muted}
            style={[s.input, { color: T.text }]}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <CloseIcon color={T.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.cancelBtn}>
          <Text style={[s.cancelTxt, { color: T.accent }]}>{L.cancel}</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color={T.accent} style={{ marginTop: 20 }} />}

      {/* Results */}
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selectCity(item)} style={[s.item, { borderBottomColor: T.border }]}>
              <LocationIcon color={T.accent} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[s.cityName, { color: T.text }]}>{item.name}</Text>
                <Text style={[s.cityDetail, { color: T.muted }]}>{item.state ? `${item.state}, ` : ''}{item.country}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Recent */}
      {results.length === 0 && query.length === 0 && recent.length > 0 && (
        <View>
          <Text style={[s.sectionTitle, { color: T.muted }]}>{L.recent}</Text>
          {recent.map((item, i) => (
            <TouchableOpacity key={i} onPress={() => selectCity(item)} style={[s.item, { borderBottomColor: T.border }]}>
              <ClockIcon color={T.muted} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[s.cityName, { color: T.text }]}>{item.name}</Text>
                <Text style={[s.cityDetail, { color: T.muted }]}>{item.country}</Text>
              </View>
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
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 16 },
  cancelBtn: { padding: 8 },
  cancelTxt: { fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  cityName: { fontSize: 16, fontWeight: '600' },
  cityDetail: { fontSize: 13, marginTop: 2 },
  noResult: { textAlign: 'center', marginTop: 40, fontSize: 15 },
});
    
