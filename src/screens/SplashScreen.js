import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Line, Path, G } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

function CloudSunSVG() {
  return (
    <Svg width={120} height={120} viewBox="0 0 100 100">
      <G>
        <Circle cx="38" cy="35" r="18" fill="#FFD700" />
        {[0,45,90,135,180,225,270,315].map((angle, i) => {
          const rad = angle * Math.PI / 180;
          return <Line key={i}
            x1={38 + 22 * Math.cos(rad)} y1={35 + 22 * Math.sin(rad)}
            x2={38 + 30 * Math.cos(rad)} y2={35 + 30 * Math.sin(rad)}
            stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />;
        })}
        <Circle cx="55" cy="60" r="22" fill="#4fc3f7" opacity={0.95} />
        <Circle cx="40" cy="58" rx="16" r="16" fill="#64b5f6" opacity={0.95} />
        <Circle cx="68" cy="62" r="15" fill="#4fc3f7" opacity={0.9} />
      </G>
    </Svg>
  );
}

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={s.root}>
      <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <CloudSunSVG />
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
  title: { fontSize: 36, fontWeight: '700', color: '#ffffff', letterSpacing: 1 },
  sub: { fontSize: 16, color: '#4fc3f7', letterSpacing: 0.5 },
  version: { position: 'absolute', bottom: 40, color: 'rgba(255,255,255,0.3)', fontSize: 12 },
});
    
