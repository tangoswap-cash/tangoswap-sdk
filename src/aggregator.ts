import { Currency } from './entities/Currency'
import { Percent } from './entities/Percent'
// import { Token } from './entities/Token'
import { TradeSmart } from './entities/TradeSmart'
import { toHex } from './router'
import invariant from 'tiny-invariant'
import { CurrencyAmount } from './entities'
// import { validateAndParseAddress } from './functions/validateAndParseAddress'
import { BigNumber } from '@ethersproject/bignumber'

/**
 * Options for producing the arguments to send call to the aggregator.
 */
export interface TradeSmartOptions {
  /**
   * How much the execution price is allowed to move unfavorably from the trade execution price.
   */
  allowedSlippage: Percent
  /**
   * How long the swap is valid until it expires, in seconds.
   * This will be used to produce a `deadline` parameter which is computed from when the swap call parameters
   * are generated.
   */
  ttl: number

  /**
   *
   */
   feePercent: Percent
}

export interface TradeSmartOptionsDeadline extends Omit<TradeSmartOptions, 'ttl'> {
  /**
   * When the transaction expires.
   * This is an atlernate to specifying the ttl, for when you do not want to use local time.
   */
  deadline: number
}

/**
 * The parameters to use in the call to the SmartSwap Aggregator to execute a trade.
 */
export interface SmartSwapParameters {
  /**
   * The method to call on the SmartSwap Aggregator.
   */
  methodName: string
  /**
   * The arguments to pass to the method, all hex encoded.
   */
  args: (string | string[])[]
  /**
   * The amount of wei to send in hex.
   */
  value: string
}

export interface GetExpectedReturnOptions {
  parts: number,
  flags: number,
}

// export function toHexPercent(percent: Percent) {
//   return `0x${percent.quotient.toString(16)}`
// }

export function toWeiBase(percent: Percent, decimals: number) : BigNumber {
  const numerator = BigNumber.from(percent.numerator.toString()).mul('1'.padEnd(decimals + 1, '0'));
  const denominator = BigNumber.from(percent.denominator.toString());
  const quotient = numerator.div(denominator);
  return quotient;
}

export function toWeiBase10(percent: Percent, decimals: number) : string {
  return toWeiBase(percent, decimals).toString();
}

export function toWeiBase16(percent: Percent, decimals: number) : string {
  return toWeiBase(percent, decimals).toHexString();
}

export function toHexNumber(x: number) {
  return `0x${x.toString(16)}`
}

const ZERO_HEX = '0x0'
const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

/**
 * Represents the SmartSwap Aggregator, and has static methods for helping execute trades.
 */
export abstract class Aggregator {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trade to produce call parameters for
   * @param options options for the call parameters
   */
  public static swapCallParameters(
    trade: TradeSmart<Currency, Currency>,
    options: TradeSmartOptions | TradeSmartOptionsDeadline
  ): SmartSwapParameters {
    const etherIn = trade.inputAmount.currency.isNative
    const etherOut = trade.outputAmount.currency.isNative
    // the aggregator does not support both ether in and out
    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    invariant(!('ttl' in options) || options.ttl > 0, 'TTL')

    // const to: string = validateAndParseAddress(options.recipient)
    const amountIn: string = toHex(trade.maximumAmountIn(options.allowedSlippage, options.feePercent))
    const minReturn: string = toHex(trade.minimumAmountOut(options.allowedSlippage, options.feePercent))
    const fromToken: string = 'address' in trade.inputAmount.currency ? trade.inputAmount.currency.address : ADDRESS_ZERO
    const destToken: string = 'address' in trade.outputAmount.currency ? trade.outputAmount.currency.address : ADDRESS_ZERO
    const distribution: string[] = trade.distribution
    const flags: string = toHexNumber(trade.flags)
    const feePercent = toWeiBase16(options.feePercent, 18);

    const deadline =
      'ttl' in options
        ? `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`
        : `0x${options.deadline.toString(16)}`


    // function swap(
    //   IERC20 fromToken,
    //   IERC20 destToken,
    //   uint256 amount,
    //   uint256 minReturn,
    //   uint256[] memory distribution,
    //   uint256 flags, // See contants in ISmartSwap.sol
    //   uint256 deadline,
    //   uint256 feePercent
    // ) public payable returns(uint256) {


    const value: string = etherIn ? amountIn : ZERO_HEX;
    const methodName: string = 'swap'
    const args: (string | string[])[] = [fromToken, destToken, amountIn, minReturn, distribution, flags, deadline, feePercent];

    return {
      methodName,
      args,
      value
    }
  }

  public static getExpectedReturnCallParameters(
    currencyAmountIn: CurrencyAmount<Currency>,
    currencyOut: Currency,
    options: GetExpectedReturnOptions
  ): SmartSwapParameters {
    const etherIn = currencyAmountIn.currency.isNative
    const etherOut = currencyOut.isNative

    // the aggregator does not support both ether in and out
    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')

    const amount: string = toHex(currencyAmountIn)
    const fromToken: string = 'address' in currencyAmountIn.currency ? currencyAmountIn.currency.address : ADDRESS_ZERO
    const destToken: string = 'address' in currencyOut ? currencyOut.address : ADDRESS_ZERO
    const flags: string = toHexNumber(options.flags)
    const parts: string = toHexNumber(options.parts)

    const value: string = etherIn ? amount : ZERO_HEX;
    const methodName: string = 'getExpectedReturn'
    const args: (string | string[])[] = [fromToken, destToken, amount, parts, flags];

    return {
      methodName,
      args,
      value
    }
  }
}
