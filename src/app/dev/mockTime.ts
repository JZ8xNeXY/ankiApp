// モックを有効にする時間帯だけ管理する　開発時間予定時間を先に入れる
const MOCK_START_HOUR = 13 // 13時
const MOCK_END_HOUR = 17 // 17時

export default function isMockTime(): boolean {
  const hour = new Date().getHours()
  return hour >= MOCK_START_HOUR && hour < MOCK_END_HOUR
}
