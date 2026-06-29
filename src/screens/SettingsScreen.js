import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const DARK = { bg: '#0f1923', card: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.08)', text: '#fff', muted: 'rgba(255,255,255,0.5)', accent: '#4fc3f7' };
const LIGHT = { bg: '#e8f4fd', card: 'rgba(255,255,255,0.85)', border: 'rgba(0,0,0,0.06)', text: '#1a2533', muted: 'rgba(0,0,0,0.45)', accent: '#0277bd' };

export default function SettingsScreen({ navigation, route }) {
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState('uz');
  const [unit, setUnit] = useState('metric');
  const [windUnit, setWindUnit] = useState('ms');

  const T = isDark ? DARK : LIGHT;

  useEffect(() => {
    loadSettings();
  }, []);

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

  const save = async (key, value) => {
    try { await AsyncStorage.setItem(key, value); } catch {}
  };

  const L = {
    uz: { title: 'Sozlamalar', theme: 'Mavzu', dark: 'Tungi', light: 'Kunduzgi', lang: 'Til', temp: 'Harorat', wind: 'Shamol' },
    ru: { title: 'Настройки', theme: 'Тема', dark: 'Тёмная', light: 'Светлая', lang: 'Язык', temp: 'Температура', wind: 'Ветер' },
    en: { title: 'Settings', theme: 'Theme', dark: 'Dark', light: 'Light', lang: 'Language', temp: 'Temperature', wind: 'Wind' },
  }[lang] || { title: 'Settings', theme: 'Theme', dark: 'Dark', light: 'Light', lang: 'Language', temp: 'Temperature', wind: 'Wind' };

  const OptionRow = ({ label, options, selected, onSelect, last }) => (
    <View style={[s.row, { borderBottomWidth: last ? 0 : 1, borderBottomColor: T.border }]}>
      <Text style={[s.rowLabel, { color: T.text }]}>{label}</Text>
      <View style={s.optBtns}>
        {options.map(o => (
          <TouchableOpacity key={o.value} onPress={() => onSelect(o.value)}
            style={[s.optBtn, { backgroundColor: selected === o.value ? T.accent : T.border }]}>
            <Text style={[s.optTxt, { color: selected === o.value ? '#0f1923' : T.muted }]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <View style={[s.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 5l-7 7 7 7" stroke={T.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={[s.title, { color: T.text }]}>{L.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Theme */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: T.muted }]}>{L.theme}</Text>
          <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <View style={s.row}>
              <Text style={[s.rowLabel, { color: T.text }]}>{isDark ? L.dark : L.light}</Text>
              <Switch
                value={isDark}
                onValueChange={(val) => { setIsDark(val); save('theme', val ? 'dark' : 'light'); }}
                trackColor={{ false: T.border, true: T.accent + '66' }}
                thumbColor={isDark ? T.accent : T.muted}
              />
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: T.muted }]}>{L.lang}</Text>
          <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <OptionRow label={L.lang}
              options={[{ value: 'uz', label: "O'zb" }, { value: 'ru', label: 'Рус' }, { value: 'en', label: 'Eng' }]}
              selected={lang} onSelect={(v) => { setLang(v); save('language', v); }} last />
          </View>
        </View>

        {/* Temperature */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: T.muted }]}>{L.temp}</Text>
          <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <OptionRow label={L.temp}
              options={[{ value: 'metric', label: '°C' }, { value: 'imperial', label: '°F' }]}
              selected={unit} onSelect={(v) => { setUnit(v); save('unit', v); }} last />
          </View>
        </View>

        {/* Wind */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: T.muted }]}>{L.wind}</Text>
          <View style={[s.card, { backgroundColor: T.card, borderColor: T.border }]}>
            <OptionRow label={L.wind}
              options={[{ value: 'ms', label: 'm/s' }, { value: 'kmh', label: 'km/h' }, { value: 'mph', label: 'mph' }]}
              selected={windUnit} onSelect={(v) => { setWindUnit(v); save('windUnit', v); }} last />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  optBtns: { flexDirection: 'row', gap: 6 },
  optBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  optTxt: { fontSize: 13, fontWeight: '600' },
});
