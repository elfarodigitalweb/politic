import { parseSentimentResponse } from '../huggingface'

describe('huggingface sentiment', () => {
  it('parseSentimentResponse extrae sentimiento con mayor score', () => {
    const mockResponse = [[
      { label: 'POS', score: 0.85 },
      { label: 'NEG', score: 0.10 },
      { label: 'NEU', score: 0.05 },
    ]]
    const result = parseSentimentResponse(mockResponse)
    expect(result.sentimiento).toBe('positivo')
    expect(result.score).toBeCloseTo(0.85, 2)
  })

  it('parseSentimentResponse mapea NEG a negativo', () => {
    const mockResponse = [[
      { label: 'NEG', score: 0.90 },
      { label: 'POS', score: 0.05 },
      { label: 'NEU', score: 0.05 },
    ]]
    expect(parseSentimentResponse(mockResponse).sentimiento).toBe('negativo')
  })

  it('parseSentimentResponse mapea NEU a neutral', () => {
    const mockResponse = [[
      { label: 'NEU', score: 0.70 },
      { label: 'POS', score: 0.20 },
      { label: 'NEG', score: 0.10 },
    ]]
    expect(parseSentimentResponse(mockResponse).sentimiento).toBe('neutral')
  })

  it('parseSentimentResponse maneja array vacío con neutral', () => {
    expect(parseSentimentResponse([[]]).sentimiento).toBe('neutral')
  })
})
