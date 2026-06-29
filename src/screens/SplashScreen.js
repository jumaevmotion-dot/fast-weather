import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Line, Ellipse, G } from 'react-native-svg';

function WeatherLogo() {
  return (
    <Svg width={100} height={100} viewBox="0 0 100 100">
      <G>
        <Circle cx="38" cy="35" r="18" fill="#FFD700" />
        {[0,45,90,135,180,225,270,315].map((angle, i) => {
          const rad = angle * Math.PI / 180;
          return <Line key={i}
            x1={38 + 22 * Math.cos(rad)} y1={35 + 22 * Math.sin(rad)}
            x2={38 + 30 * Math.cos(rad)} y2={35 + 30 * Math.sin(rad)}
            stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />;
        })}
        <Ellipse cx="60" cy="62" rx="28" ry="16" fill="#4fc3f7" opacity={0.95} />
        <Ellipse cx="44" cy="58" rx="20" ry="14" fill="#64b5f6" opacity={0.95} />
        <Ellipse cx="72" cy="65" rx="16" ry="12" fill="#4fc3f7" opacity={0.9} />
      </G>
    </Svg>
  );
}

export default function SplashScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={s.root}>
      <Animated.View style={[s.content, { opacity: fade, transform: [{ scale }] }]}>
        <WeatherLogo />
        <Text style={s.title}>Fast Weather</Text>
        <Text style={s.sub}>Tez va aniq ob-havo</Text>
      </Animated.View>
      <Text style={s.version}>v1.0.0</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f1923', alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', gap: 16 },
  title: { fontSize: 34, fontWeight: '700', color: '#ffffff', marginTop: 8 },
  sub: { fontSize: 15, color: '#4fc3f7' },
  version: { position: 'absolute', bottom: 36, color: 'rgba(255,255,255,0.25)', fontSize: 12 },
});
    
