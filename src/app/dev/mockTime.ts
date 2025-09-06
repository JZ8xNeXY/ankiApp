// モックを有効にする時間帯だけ管理する　開発時間予定時間を先に入れる
const MOCK_START_HOUR = 19 // 13時
const MOCK_END_HOUR = 21 // 17時

export function isMockTime(): boolean {
  const hour = new Date().getHours()
  return hour >= MOCK_START_HOUR && hour < MOCK_END_HOUR
}
