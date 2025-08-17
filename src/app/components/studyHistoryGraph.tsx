import { doc, getDoc } from 'firebase/firestore'
import React, { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native'
import { BarChart } from 'react-native-chart-kit'
import { auth, db } from '../../config'

const screenWidth = Dimensions.get('window').width
const BAR_WIDTH = 28 // 棒の太さ（px）
const GAP = 12 // 棒の間隔（px）
const H_PADDING = 16 // 外側左右余白（px）

const StudyHistoryGraph = () => {
  const DATA = [
    { x: '8/10', y: 100 },
    { x: '8/11', y: 200 },
    { x: '8/12', y: 300 },
    { x: '8/13', y: 100 },
    { x: '8/14', y: 200 },
    { x: '8/15', y: 1000 },
    { x: '8/16', y: 400 },
    { x: '8/17', y: 500 },
    { x: '8/18', y: 600 },
    { x: '8/19', y: 700 },
  ]
  const labels = DATA.map((d) => d.x)
  const values = DATA.map((d) => d.y)

  const scrollRef = useRef<ScrollView>(null)

  // Y軸ラベル（
  const maxY = Math.max(...values)
  const steps = 4
  const yLabels = Array.from({ length: steps + 1 }, (_, i) =>
    Math.round((maxY / steps) * (steps - i)),
  )

  // 横幅をデータ数に応じて調整
  const chartWidth = Math.max(
    screenWidth - H_PADDING * 2,
    DATA.length * (BAR_WIDTH + GAP) + H_PADDING * 2,
  )

  // 初期スクロールを右端に寄せる
  useEffect(() => {
    const x = chartWidth - (screenWidth - H_PADDING * 2)
    console.log('スクロール', x)
    scrollRef.current?.scrollTo({ x, animated: false })
  }, [chartWidth])

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: H_PADDING,
        backgroundColor: '#fff',
      }}
    >
      <View
        style={{
          justifyContent: 'space-between',
          height: 192,
          marginRight: 4,
        }}
      >
        {yLabels.map((label, i) => (
          <Text
            key={i}
            style={{ fontSize: 12, color: '#555', justifyContent: 'center' }}
          >
            {label}
          </Text>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => {
          scrollRef.current?.scrollToEnd({ animated: false })
        }}
      >
        <BarChart
          data={{ labels, datasets: [{ data: values }] }}
          width={labels.length * 60}
          height={230}
          fromZero
          yAxisLabel=""
          yAxisSuffix=""
          withHorizontalLabels={false} // Y軸ラベルを消す
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: () => `rgba(76, 175, 80, 1)`,
            labelColor: () => '#555',
            propsForBackgroundLines: { stroke: '#eee' },
            barPercentage: 0.6,
          }}
          style={{ borderRadius: 12, marginRight: 16, marginLeft: -60 }}
          showValuesOnTopOfBars
          withInnerLines
        />
      </ScrollView>
    </View>
  )
}

export default StudyHistoryGraph
