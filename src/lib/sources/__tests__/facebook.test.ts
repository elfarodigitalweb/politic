import {
  buildAppToken,
  calcularSentimientoReacciones,
  buildFacebookPageUrl,
} from '../facebook'

describe('facebook fetcher', () => {
  it('buildAppToken concatena app_id y app_secret con pipe', () => {
    const token = buildAppToken('123', 'abc')
    expect(token).toBe('123|abc')
  })

  it('buildFacebookPageUrl genera URL correcta', () => {
    const url = buildFacebookPageUrl('claudiovidal.gobernador', '123|abc')
    expect(url).toContain('graph.facebook.com')
    expect(url).toContain('claudiovidal.gobernador')
    expect(url).toContain('reactions')
    expect(url).toContain('access_token=123|abc')
  })

  it('calcularSentimientoReacciones positivo cuando likes > angry', () => {
    const result = calcularSentimientoReacciones({ like: 100, love: 50, angry: 10, sad: 5 })
    expect(result.sentimiento).toBe('positivo')
    expect(result.score).toBeGreaterThan(0.5)
  })

  it('calcularSentimientoReacciones negativo cuando angry > likes', () => {
    const result = calcularSentimientoReacciones({ like: 10, love: 5, angry: 80, sad: 20 })
    expect(result.sentimiento).toBe('negativo')
  })

  it('calcularSentimientoReacciones neutral cuando no hay reacciones', () => {
    const result = calcularSentimientoReacciones({ like: 0, love: 0, angry: 0, sad: 0 })
    expect(result.sentimiento).toBe('neutral')
  })
})
