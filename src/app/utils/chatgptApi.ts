import axios from 'axios'

const API_URL =
  'https://vvw1xgx7t9.execute-api.ap-northeast-1.amazonaws.com/dev/openAIAPI' // LambdaをつないだAPI GatewayのURL

const generateFlashcard = async (prompt: string) => {
  console.log('Generating flashcard with prompt:', prompt)
  try {
    const response = await axios.post(API_URL, { prompt }) // POSTでpromptを渡す
    
    const data = response.data
    
    return {
      front: data.front,
      back: data.back,
      tag: data.tag,
    }
  } catch (error) {
    console.error('Gateway API Error:', error)
    return null
  }
}

export default generateFlashcard