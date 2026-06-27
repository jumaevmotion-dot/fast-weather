import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Line, Path, G, Ellipse } from 'react-native-svg';

const { width: W } = Dimensions.get('window');

const LANGS = [
  { code: 'uz', label: "O'zbek", flag: '🇺🇿', native: "O'zbek tili" },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', native: 'Русский язык' },
  { code: 'en', label: 'English', flag: '🇬🇧', native: 'English' },
];

function WeatherIllustration() {
  return (
    <Svg width={200} height={160} viewBox="0 0 200 160">
      <Circle cx="70" cy="60" r="35" fill="#FFD700" opacity={0.9} />
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const rad = angle * Math.PI / 180;
        return <Line key={i}
          x1={70 + 40 * Math.cos(rad)} y1={60 + 40 * Math.sin(rad)}
          x2={70 + 52 * Math.cos(rad)} y2={60 + 52 * Math.sin(rad)}
          stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />;
      })}
      <Ellipse cx="120" cy="95" rx="55" ry="28" fill="#4fc3f7" opacity={0.95} />
      <Ellipse cx="95" cy="88" rx="38" ry="26" fill="#64b5f6" opacity={0.9} />
      <Ellipse cx="145" cy="98" rx="32" ry="22" fill="#4fc3f7" opacity={0.85} />
      <Line x1="100" y1="120" x2="94" y2="140" stroke="#90caf9" strokeWidth="3" strokeLinecap="round" />
      <Line x1="120" y1="120" x2="114" y2="140" stroke="#90caf9" strokeWidth="3" strokeLinecap="round" />
      <Line x1="140" y1="120" x2="134" y2="140" stroke="#90caf9" strokeWidth="3" strokeLinecap="round" />
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
    } catch {}
    navigation.replace('Home', { lang: selectedLang });
  };

  return (
    <View style={s.root}>
      <View style={s.top}>
        <WeatherIllustration />
        <Text style={s.title}>Fast Weather</Text>
        <Text style={s.desc}>
          Joylashuvingizga qarab{'\n'}aniq ob-havo ma'lumotlari
        </Text>
      </View>

      <View style={s.langSection}>
        <Text style={s.langTitle}>Tilni tanlang</Text>
        <View style={s.langList}>
          {LANGS.map(l => (
            <TouchableOpacity key={l.code} onPress={() => setSelectedLang(l.code)}
              style={[s.langBtn, selectedLang === l.code && s.langBtnActive]}>
              <Text style={s.flag}>{l.flag}</Text>
              <View>
                <Text style={[s.langLabel, selectedLang === l.code && s.langLabelActive]}>{l.label}</Text>
                <Text style={s.langNative}>{l.native}</Text>
              </View>
              {selectedLang === l.code && (
                <View style={s.checkCircle}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={s.continueBtn} onPress={handleContinue}>
        <Text style={s.continueTxt}>
          {selectedLang === 'uz' ? 'Boshlash' : selectedLang === 'ru' ? 'Начать' : 'Get Started'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f1923', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  top: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', marginTop: 20, marginBottom: 10 },
  desc: { fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 22 },
  langSection: { flex: 1 },
  langTitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
  langList: { gap: 10 },
  langBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'transparent' },
  langBtnActive: { borderColor: '#4fc3f7', backgroundColor: 'rgba(79,195,247,0.1)' },
  flag: { fontSize: 28 },
  langLabel: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  langLabelActive: { color: '#fff' },
  langNative: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  checkCircle: { marginLeft: 'auto', width: 24, height: 24, borderRadius: 12, backgroundColor: '#4fc3f7', alignItems: 'center', justifyContent: 'center' },
  continueBtn: { backgroundColor: '#4fc3f7', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 20 },
  continueTxt: { fontSize: 17, fontWeight: '700', color: '#0f1923' },
});
                                                              
