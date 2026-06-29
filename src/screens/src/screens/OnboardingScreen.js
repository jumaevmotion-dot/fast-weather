import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Line, Ellipse, G } from 'react-native-svg';

const LANGS = [
  { code: 'uz', label: "O'zbek", native: "O'zbek tili" },
  { code: 'ru', label: 'Русский', native: 'Русский язык' },
  { code: 'en', label: 'English', native: 'English' },
];

function Illustration() {
  return (
    <Svg width={180} height={140} viewBox="0 0 180 140">
      <Circle cx="60" cy="55" r="32" fill="#FFD700" opacity={0.9} />
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const rad = angle * Math.PI / 180;
        return <Line key={i}
          x1={60 + 37 * Math.cos(rad)} y1={55 + 37 * Math.sin(rad)}
          x2={60 + 47 * Math.cos(rad)} y2={55 + 47 * Math.sin(rad)}
          stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />;
      })}
      <Ellipse cx="110" cy="88" rx="52" ry="26" fill="#4fc3f7" opacity={0.95} />
      <Ellipse cx="88" cy="82" rx="36" ry="24" fill="#64b5f6" opacity={0.9} />
      <Ellipse cx="135" cy="90" rx="30" ry="20" fill="#4fc3f7" opacity={0.85} />
      <Line x1="90" y1="112" x2="84" y2="130" stroke="#90caf9" strokeWidth="3" strokeLinecap="round" />
      <Line x1="110" y1="112" x2="104" y2="130" stroke="#90caf9" strokeWidth="3" strokeLinecap="round" />
      <Line x1="128" y1="112" x2="122" y2="130" stroke="#90caf9" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export default function OnboardingScreen({ navigation }) {
  const [selectedLang, setSelectedLang] = useState('uz');

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem('onboarding_done', 'true');
      await AsyncStorage.setItem('language', selectedLang);
      await AsyncStorage.setItem('theme', 'dark');
      await AsyncStorage.setItem('unit', 'metric');
      await AsyncStorage.setItem('windUnit', 'ms');
    } catch {}
    navigation.replace('Home');
  };

  return (
    <View style={s.root}>
      <View style={s.top}>
        <Illustration />
        <Text style={s.title}>Fast Weather</Text>
        <Text style={s.desc}>Joylashuvingizga qarab{'\n'}aniq ob-havo ma'lumotlari</Text>
      </View>

      <View style={s.langSection}>
        <Text style={s.langTitle}>Tilni tanlang</Text>
        {LANGS.map(l => (
          <TouchableOpacity key={l.code} onPress={() => setSelectedLang(l.code)}
            style={[s.langBtn, selectedLang === l.code && s.langBtnActive]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.langLabel, selectedLang === l.code && s.langLabelActive]}>{l.label}</Text>
              <Text style={s.langNative}>{l.native}</Text>
            </View>
            {selectedLang === l.code && (
              <View style={s.check}>
                <Text style={{ color: '#0f1923', fontSize: 12, fontWeight: '700' }}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={s.btn} onPress={handleContinue}>
        <Text style={s.btnTxt}>
          {selectedLang === 'uz' ? 'Boshlash' : selectedLang === 'ru' ? 'Начать' : 'Get Started'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f1923', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  top: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 30, fontWeight: '700', color: '#fff', marginTop: 16, marginBottom: 8 },
  desc: { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 22 },
  langSection: { flex: 1, gap: 10 },
  langTitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  langBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent' },
  langBtnActive: { borderColor: '#4fc3f7', backgroundColor: 'rgba(79,195,247,0.1)' },
  langLabel: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  langLabelActive: { color: '#fff' },
  langNative: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#4fc3f7', alignItems: 'center', justifyContent: 'center' },
  btn: { backgroundColor: '#4fc3f7', borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 16 },
  btnTxt: { fontSize: 16, fontWeight: '700', color: '#0f1923' },
});
        
