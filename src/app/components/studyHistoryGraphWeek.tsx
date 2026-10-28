import {
  collection,
  Timestamp,
  query,
  onSnapshot,
  orderBy,
} from 'firebase/firestore'
import React, { useState, useRef, useEffect } from 'react'
import { View, Text, Dimensions, ScrollView } from 'react-native'
import { BarChart } from 'react-native-chart-kit'
import { auth, db } from '../../config'

interface StudyLog {
  id: string
  count: number
  date: Timestamp
  day: number
  month: number
  year: number
  isoWeek: number
  isoYear: number
  yearMonth: string
  updatedAt: Timestamp
}

interface ChartDataset {
  data: number[]
  color?: (opacity: number) => string
  strokeWidth?: number
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

const screenWidth = Dimensions.get('window').width
const BAR_WIDTH = 28 // 棒の太さ（px）
const GAP = 12 // 棒の間隔（px）
const H_PADDING = 16 // 外側左右余白（px）

const StudyHistoryGraph = () => {
  const [, setStudyLogs] = useState<StudyLog[]>([])
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [{ data: [] }],
  })
  const [chartWidth, setChartWidth] = useState<number>()
  const [yLabels, setYLabels] = useState<string[]>([]) // ← 空配列で初期化

  const [, setLoading] = useState(true)

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null)

  useEffect(() => {
    if (!auth.currentUser) return
    setLoading(true)

    // ⏰ モック時間ならダミーデータをセット
    // if (isMockTime()) {
    //   const MOCK_LOGS: StudyLog[] = [
    //     {
    //       id: '20250815',
    //       count: 25,
    //       date: Timestamp.now(),
    //       day: 15,
    //       month: 8,
    //       year: 2025,
    //       isoWeek: 33,
    //       isoYear: 2025,
    //       yearMonth: '2025-08',
    //       updatedAt: Timestamp.now(),
    //     },
    //     {
    //       id: '20250816',
    //       count: 16,
    //       date: Timestamp.now(),
    //       day: 16,
    //       month: 8,
    //       year: 2025,
    //       isoWeek: 33,
    //       isoYear: 2025,
    //       yearMonth: '2025-08',
    //       updatedAt: Timestamp.now(),
    //     },
    //   ]
    //   setStudyLogs(MOCK_LOGS)
    //   setLoading(false)
    //   console.log('onSnapshot は開発モードなので停止中')
    //   return
    // }

    // 🔁 Firestore リアルタイム監視

    const logRef = collection(db, `users/${auth.currentUser.uid}/studyLogs`)
    const unsubscribe = onSnapshot(
      query(logRef, orderBy('__name__')), // docId(YYYYMMDD)順
      async (snapshot) => {
        const logs: StudyLog[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as StudyLog[]

        const weeklyLogs: Record<string, number> = {}
        console.log('週のデータ読み込み中')

        logs.forEach((log) => {
          const key = `${log.isoWeek}週`
          if (!weeklyLogs[key]) {
            weeklyLogs[key] = 0
          }
          weeklyLogs[key] += log.count
        })

        // 📊 グラフ用データ（先に作る）
        const labels = Object.keys(weeklyLogs) // ['33周目', '34週目', ...]
        const values = Object.values(weeklyLogs) // [330, 873, 459, ...]

        // ✅ 横幅は logs/labels の長さを使う（DATA は使わない）
        const chartWidth = Math.max(
          screenWidth - H_PADDING,
          labels.length * (BAR_WIDTH + GAP) + H_PADDING,
        )
        setChartWidth(chartWidth)

        const maxY = Math.max(0, ...values)
        const steps = 4
        const yLabels = Array.from(
          { length: steps + 1 },
          (_, i) => `${Math.round((maxY / steps) * (steps - i))}枚`,
        )
        setYLabels(yLabels)

        setStudyLogs(logs)
        setChartData({ labels, datasets: [{ data: values }] })
        setLoading(false)
      },
      (err) => {
        console.error('onSnapshot error:', err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: H_PADDING,
        backgroundColor: '#fff',
        marginTop: 50,
        marginBottom: 240,
        marginHorizontal: 10,
        borderRadius: 10,
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
          data={chartData}
          width={chartWidth ?? screenWidth}
          height={230}
          fromZero
          yAxisLabel=""
          yAxisSuffix=""
          withHorizontalLabels={false} // Y軸ラベルを消す
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: () => `#255a26`,
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
