import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const getTipByTime = (hour: number) => {
   if (hour >= 5 && hour < 10) {
    return {
      title: '朝のヒント',
      lines: ['一日の始まりに学習を習慣づけましょう']
    }
  } else if (hour >= 10 && hour < 14) {
    return {
      title: '昼のヒント',
      lines: ['スキマ時間を使って', '数分だけでも復習しましょう']
    }
  } else if (hour >= 14 && hour < 18) {
    return {
      title: '午後のヒント',
      lines: ['集中力が切れやすい時間帯です。','短時間でも継続が大切']
    }
  } else if (hour >= 18 && hour < 23) {
    return {
      title: '夜のヒント',
      lines: ['今日の復習を振り返って', '理解を深めましょう']
    }
  } else {
    return {
      title: '深夜のヒント',
      lines: ['夜更かししすぎずに', 'しっかり休みましょう']
    }
  }
};

const TipBox = () => {
  const [tip, setTip] = useState(getTipByTime(0));

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const message = getTipByTime(hour);
    setTip(message);
  }, []);

  return (
    <View style={styles.tipTextContainer}>
      <Text style={styles.tipTitle}>{tip.title}</Text>
         {tip.lines.map((line, index) => (
        <Text style={styles.tipText} key={index}>{line}</Text>
      ))}
    </View>
  );
};

export default TipBox;

const styles = StyleSheet.create({
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
})