import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Line, G } from 'react-native-svg';
import { DARK_THEME, LIGHT_THEME } from '../constants/themes';

function BackIcon({ color }) {
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 5l-7 7 7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

function MoonIcon({ color }) {
  return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>;
}

function SunIcon({ color }) {
  return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" />
    <Line x1="12" y1="1" x2="12" y2="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="12" y1="21" x2="12" y2="23" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="1" y1="12" x2="3" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="21" y1="12" x2="23" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>;
}

function GlobeIcon({ color }) {
  return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
    <Path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" stroke={color} strokeWidth="1.5" />
    <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.5" />
  </Svg>;
}

function ThermometerIcon({ color }) {
  return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}

function WindIcon({ color }) {
  return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>;
}

export default function SettingsScreen({ navigation, route }) {
  const [isDark, setIsDark] = useState(route.params?.isDark ?? true);
  const [lang, setLang] = useState(route.params?.lang ?? 'uz');
  const [unit, setUnit] = useState(route.params?.unit ?? 'metric');
  const [windUnit, setWindUnit] = useState(route.params?.windUnit ?? 'ms');

  const T = isDark ? DARK_THEME : LIGHT_THEME;

  const save = async (key, value) => {
    try { await AsyncStorage.setItem(key, value); } catch {}
  };

  const toggleTheme = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    save('theme', newVal ? 'dark' : 'light');
    route.params?.onSettingsChange?.({ isDark: newVal, lang, unit, windUnit });
  };

  const changeLang = (l) => {
    setLang(l);
    save('language', l);
    route.params?.onSettingsChange?.({ isDark, lang: l, unit, windUnit });
  };

  const changeUnit = (u) => {
    setUnit(u);
    save('unit', u);
    route.params?.onSettingsChange?.({ isDark, lang, unit: u, windUnit });
  };

  const changeWindUnit = (w) => {
    setWindUnit(w);
    save('windUnit', w);
    route.params?.onSettingsChange?.({ isDark, lang, unit, windUnit: w });
  };

  const labels = {
    uz: { title: 'Sozlamalar', theme: 'Mavzu', dark: 'Tungi', light: 'Kunduzgi', lang: 'Til', temp: 'Harorat', wind: 'Shamol tezligi' },
    ru: { title: 'Настройки', theme: 'Тема', dark: 'Тёмная', light: 'Светлая', lang: 'Язык', temp: 'Температура', wind: 'Скорость ветра' },
    en: { title: 'Settings', theme: 'Theme', dark: 'Dark', light: 'Light', lang: 'Language', temp: 'Temperature', wind: 'Wind Speed' },
  };
  const L = labels[lang] || labels.uz;

  const Section = ({ title, children }) => (
    <View style={s.section}>
      <Text style={[s.sectionTitle, { color: T.muted }]}>{title}</Text>
      <View style={[s.sectionCard, { backgroundColor: T.card, borderColor: T.border }]}>{children}</View>
    </View>
  );

  const OptionRow = ({ icon, label, options, selected, onSelect, last }) => (
    <View style={[s.row, { borderBottomColor: T.border, borderBottomWidth: last ? 0 : 1 }]}>
      <View style={s.rowLeft}>
        {icon}
        <Text style={[s.rowLabel, { color: T.text }]}>{label}</Text>
      </View>
      <View style={s.optionBtns}>
        {options.map(o => (
          <TouchableOpacity key={o.value} onPress={() => onSelect(o.value)}
            style={[s.optBtn, { backgroundColor: selected === o.value ? T.accent : T.border }]}>
            <Text style={[s.optTxt, { color: selected === o.value ? (isDark ? '#0f1923' : '#fff') : T.muted }]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: T.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <BackIcon color={T.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: T.text }]}>{L.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Theme */}
        <Section title={L.theme}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              {isDark ? <MoonIcon color={T.accent} /> : <SunIcon color={T.accent} />}
              <Text style={[s.rowLabel, { color: T.text }]}>{isDark ? L.dark : L.light}</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: T.border, true: T.accent + '66' }} thumbColor={isDark ? T.accent : T.muted} />
          </View>
        </Section>

        {/* Language */}
        <Section title={L.lang}>
          <OptionRow
            icon={<GlobeIcon color={T.accent} />}
            label={L.lang}
            options={[{ value: 'uz', label: "O'zb" }, { value: 'ru', label: 'Рус' }, { value: 'en', label: 'Eng' }]}
            selected={lang}
            onSelect={changeLang}
            last
          />
        </Section>

        {/* Temperature */}
        <Section title={L.temp}>
          <OptionRow
            icon={<ThermometerIcon color={T.accent} />}
            label={L.temp}
            options={[{ value: 'metric', label: '°C' }, { value: 'imperial', label: '°F' }]}
            selected={unit}
            onSelect={changeUnit}
            last
          />
        </Section>

        {/* Wind */}
        <Section title={L.wind}>
          <OptionRow
            icon={<WindIcon color={T.accent} />}
            label={L.wind}
            options={[{ value: 'ms', label: 'm/s' }, { value: 'kmh', label: 'km/h' }, { value: 'mph', label: 'mph' }]}
            selected={windUnit}
            onSelect={changeWindUnit}
            last
          />
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  optionBtns: { flexDirection: 'row', gap: 6 },
  optBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  optTxt: { fontSize: 13, fontWeight: '600' },
});
    
