import { ONE, ZERO } from '../constants'

import { Currency } from './Currency'
import { CurrencyAmount } from './CurrencyAmount'
import { Fraction } from './Fraction'
import { Percent } from './Percent'
import { Price } from './Price'
import invariant from 'tiny-invariant'

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export class TradeSmart<TInput extends Currency, TOutput extends Currency> {
  /**
   * The input amount for the trade assuming no slippage.
   */
  public readonly inputAmount: CurrencyAmount<TInput>

  /**
   * The output amount for the trade assuming no slippage.
   */
  public readonly outputAmount: CurrencyAmount<TOutput>

  /**
   * The price expressed in terms of output amount/input amount.
   */
  public readonly executionPrice: Price<TInput, TOutput>

  /**
   * Aggregator distribution array
   */
  public readonly distribution: string[]

  /**
   * Aggregator flags
   */
  public readonly flags: number


  public constructor(
    inputAmount: CurrencyAmount<TInput>,
    outputAmount: CurrencyAmount<TOutput>,
    distribution: string[],
    flags: number
  ) {
    this.inputAmount = inputAmount
    this.outputAmount = outputAmount
    this.distribution = distribution
    this.flags = flags

    this.executionPrice = new Price(
      this.inputAmount.currency,
      this.outputAmount.currency,
      this.inputAmount.quotient,
      this.outputAmount.quotient
    )
  }

  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   * @param feePercent aggregator dev fee %
   */
  public minimumAmountOut(slippageTolerance: Percent, feePercent: Percent): CurrencyAmount<TOutput> {
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
    invariant(!feePercent.lessThan(ZERO), 'FEE_PERCENT')

    const feePercentAdjustedAmountOut = new Fraction(ONE)
      .add(feePercent)
      .invert()
      .multiply(this.outputAmount.quotient)

    const slippageAdjustedAmountOut = new Fraction(ONE)
      .add(slippageTolerance)
      .invert()
      .multiply(feePercentAdjustedAmountOut.quotient)

    return CurrencyAmount.fromRawAmount(this.outputAmount.currency, slippageAdjustedAmountOut.quotient)
  }

  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  public maximumAmountIn(slippageTolerance: Percent, feePercent: Percent): CurrencyAmount<TInput> {
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
    invariant(!feePercent.lessThan(ZERO), 'FEE_PERCENT')
    return this.inputAmount
  }

  /**
   * Return the execution price after accounting for slippage tolerance
   * @param slippageTolerance the allowed tolerated slippage
   */
  public worstExecutionPrice(slippageTolerance: Percent, feePercent: Percent): Price<TInput, TOutput> {
    return new Price(
      this.inputAmount.currency,
      this.outputAmount.currency,
      this.maximumAmountIn(slippageTolerance, feePercent).quotient,
      this.minimumAmountOut(slippageTolerance, feePercent).quotient
    )
  }
}
