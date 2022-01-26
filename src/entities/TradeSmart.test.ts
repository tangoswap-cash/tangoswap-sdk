import { CurrencyAmount, SmartBCH, Percent, Price, Token, TradeSmart } from '.'

import JSBI from 'jsbi'

describe('TradeSmart', () => {
  const ETHER = SmartBCH.onChain(10000)
  const token0 = new Token(10000, '0x0000000000000000000000000000000000000001', 18, 't0')
  const token2 = new Token(10000, '0x0000000000000000000000000000000000000003', 18, 't2')

  it('can be constructed with ETHER as input', () => {
    const trade = new TradeSmart(
      CurrencyAmount.fromRawAmount(SmartBCH.onChain(10000), JSBI.BigInt(100)),
      CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(100)),
      [],
      1
    )
    expect(trade.inputAmount.currency).toEqual(ETHER)
    expect(trade.outputAmount.currency).toEqual(token0)
  })

  it('can be constructed with ETHER as output for exact input', () => {
    const trade = new TradeSmart(
      CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(100)),
      CurrencyAmount.fromRawAmount(SmartBCH.onChain(10000), JSBI.BigInt(100)),
      [],
      1
    )
    expect(trade.inputAmount.currency).toEqual(token0)
    expect(trade.outputAmount.currency).toEqual(ETHER)
  })

  describe('#maximumAmountIn', () => {
    const exactIn = new TradeSmart(
      CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(100)),
      CurrencyAmount.fromRawAmount(token2, JSBI.BigInt(100)),
      [],
      1
    )
    it('throws if slippageTolerance is less than 0', () => {
      expect(() => exactIn.maximumAmountIn(new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)), new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)))).toThrow(
        'SLIPPAGE_TOLERANCE'
      )
    })
    it('throws if feePercent is less than 0', () => {
      expect(() => exactIn.maximumAmountIn(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)), new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)))).toThrow(
        'FEE_PERCENT'
      )
    })
    it('returns exact if 0,0', () => {
      expect(exactIn.maximumAmountIn(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)), new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(exactIn.inputAmount)
    })
    it('returns exact if nonzero', () => {
      expect(exactIn.maximumAmountIn(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)), new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(
        CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(100))
      )
      expect(exactIn.maximumAmountIn(new Percent(JSBI.BigInt(5), JSBI.BigInt(100)), new Percent(JSBI.BigInt(5), JSBI.BigInt(100)))).toEqual(
        CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(100))
      )
      expect(exactIn.maximumAmountIn(new Percent(JSBI.BigInt(200), JSBI.BigInt(100)), new Percent(JSBI.BigInt(200), JSBI.BigInt(100)))).toEqual(
        CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(100))
      )
    })
  })

  describe('#minimumAmountOut', () => {
    const exactIn = new TradeSmart(
      CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(100)),
      CurrencyAmount.fromRawAmount(token2, JSBI.BigInt(100)),
      [],
      1
    )
    it('throws if slippageTolerance is less than 0', () => {
      expect(() => exactIn.minimumAmountOut(new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)), new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)))).toThrow(
        'SLIPPAGE_TOLERANCE'
      )
    })
    it('throws if feePercent is less than 0', () => {
      expect(() => exactIn.minimumAmountOut(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)), new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)))).toThrow(
        'FEE_PERCENT'
      )
    })
    it('returns exact if 0, 0', () => {
      expect(exactIn.minimumAmountOut(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)), new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(exactIn.outputAmount)
    })
    it('returns exact if nonzero', () => {
      expect(exactIn.minimumAmountOut(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)), new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(
        CurrencyAmount.fromRawAmount(token2, JSBI.BigInt(100))
      )
      expect(exactIn.minimumAmountOut(new Percent(JSBI.BigInt(5), JSBI.BigInt(100)), new Percent(JSBI.BigInt(5), JSBI.BigInt(100)))).toEqual(
        CurrencyAmount.fromRawAmount(token2, JSBI.BigInt(90))
      )
      expect(exactIn.minimumAmountOut(new Percent(JSBI.BigInt(200), JSBI.BigInt(100)), new Percent(JSBI.BigInt(200), JSBI.BigInt(100)))).toEqual(
        CurrencyAmount.fromRawAmount(token2, JSBI.BigInt(11))
      )
    })
  })

  describe('#worstExecutionPrice', () => {
    const exactIn = new TradeSmart(
      CurrencyAmount.fromRawAmount(token0, 100),
      CurrencyAmount.fromRawAmount(token2, 100),
      [],
      1
    )
    it('throws if slippageTolerance is less than 0', () => {
      expect(() => exactIn.minimumAmountOut(new Percent(-1, 100), new Percent(-1, 100))).toThrow(
        'SLIPPAGE_TOLERANCE'
      )
    })
    it('throws if feePercent is less than 0', () => {
      expect(() => exactIn.minimumAmountOut(new Percent(0, 100), new Percent(-1, 100))).toThrow(
        'FEE_PERCENT'
      )
    })
    it('returns exact if 0', () => {
      expect(exactIn.worstExecutionPrice(new Percent(0, 100), new Percent(0, 100))).toEqual(exactIn.executionPrice)
    })
    it('returns exact if nonzero', () => {
      expect(exactIn.worstExecutionPrice(new Percent(0, 100), new Percent(0, 100))).toEqual(new Price(token0, token2, 100, 100))
      expect(exactIn.worstExecutionPrice(new Percent(5, 100), new Percent(5, 100))).toEqual(new Price(token0, token2, 100, 90))
      expect(exactIn.worstExecutionPrice(new Percent(200, 100), new Percent(200, 100))).toEqual(new Price(token0, token2, 100, 11))
    })
  })
})
