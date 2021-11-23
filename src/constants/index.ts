import { ChainId } from '../enums'
import JSBI from 'jsbi'

export * from './addresses'
export * from './kashi'
export * from './natives'
export * from './numbers'
export * from './tokens'

export const INIT_CODE_HASH: { [chainId: number]: string } = {
  [ChainId.SMARTBCH]:       '0x82226b3d3ddd32a8246b1fa1273d7f3c7016d3606bf2df8b33935b2b407d725a',
  [ChainId.SMARTBCH_AMBER]: '0x82226b3d3ddd32a8246b1fa1273d7f3c7016d3606bf2df8b33935b2b407d725a',
}

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256'
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
}

export const LAMBDA_URL = 'https://9epjsvomc4.execute-api.us-east-1.amazonaws.com/dev'

export const SOCKET_URL = 'wss://hfimt374ge.execute-api.us-east-1.amazonaws.com/dev'
