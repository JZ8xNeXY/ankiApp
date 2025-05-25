import axios from 'axios'

const API_URL = process.env.EXPO_PUBLIC_OPENAI_API_URL
const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY
 // LambdaをつないだAPI GatewayのURL

const generateFlashcard = async (prompt: string) => {
  console.log('Generating flashcard with prompt:', prompt)
  try {
    const response = await axios.post(API_URL, { prompt },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
    })
   
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