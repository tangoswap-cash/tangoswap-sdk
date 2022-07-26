import { Currency } from './entities/Currency'
import { toHex } from './router'
import invariant from 'tiny-invariant'
import { CurrencyAmount } from './entities'

/**
 * The parameters to use in the call to the limit-order contract to execute a trade.
 */
export interface LimitOrderParameters {
  /**
   * The method to call on the limit-order contract.
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

function bnToHex(n: bigint) {
  return "0x" + n.toString(16)
}

const ZERO_HEX = '0x0'

/**
 * Represents the limit-order contract, and has static methods for helping execute trades.
 */
export abstract class LimitOrder {
  /**
   * Cannot be constructed.
   */
  private constructor() {}


// function getSigner(
//     uint256 coinsToMaker,
//     uint256 coinsToTaker,
//     uint256 dueTime80_v8_version8,
//     bytes32 r,
//     bytes32 s
// ) public view returns (address) {
//     bytes32 eip712Hash = getEIP712Hash(coinsToMaker, coinsToTaker, dueTime80_v8_version8 >> 16);
//     uint8 v = uint8(dueTime80_v8_version8 >> 8);
//     return ecrecover(eip712Hash, v, r, s);
  // }

  public static getSignerCallParameters(
    coinsToMaker: string,
    coinsToTaker: string,
    dueTime80: string,
    r: string,
    s: string,
  ): LimitOrderParameters {
    const value: string = ZERO_HEX;
    const methodName: string = 'getSigner'
    const args: (string | string[])[] = [coinsToMaker, coinsToTaker, dueTime80, r, s];

    return {
      methodName,
      args,
      value
    }
  }

  public static directExchangeCallParameters(
    inputAmount: CurrencyAmount<Currency>,
    outputAmount: CurrencyAmount<Currency>,
    coinsToMaker: string,
    coinsToTaker: string,
    dueTime80: string,
    r: string,
    s: string,
    v: number,
    version: number
  ): LimitOrderParameters {
    const etherIn = inputAmount.currency.isNative
    const etherOut = outputAmount.currency.isNative
    // limit orders does not support both ether in and out
    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')

    const dueTime80_v8_version8 = bnToHex(
                                    (BigInt(dueTime80) << 16n) |
                                    (BigInt(v) << 8n) |
                                    BigInt(version)
                                  );

    const amountIn: string = toHex(inputAmount)

    const value: string = etherIn ? amountIn : ZERO_HEX;
    const methodName: string = 'directExchange'
    const args: (string | string[])[] = [coinsToMaker, coinsToTaker, dueTime80_v8_version8, r, s];

    //   function directExchange(
    //     uint256 coinsToMaker,
    //     uint256 coinsToTaker,
    //     uint256 dueTime80_v8_version8,
    //     bytes32 r,
    //     bytes32 s
    // ) external payable {

    return {
      methodName,
      args,
      value
    }
  }
}
