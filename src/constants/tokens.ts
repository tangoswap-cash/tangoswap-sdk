import { FLEXUSD_ADDRESS, WBCH_ADDRESS } from './addresses'

import { ChainId } from '../enums'
import { Token } from '../entities/Token'
import { TokenMap } from '../types/TokenMap'

export const FLEXUSD: TokenMap = {
  [ChainId.SMARTBCH]: new Token(ChainId.SMARTBCH, FLEXUSD_ADDRESS[ChainId.SMARTBCH], 18, 'flexUSD', 'flexUSD'),
  [ChainId.SMARTBCH_AMBER]: new Token(ChainId.SMARTBCH_AMBER, FLEXUSD_ADDRESS[ChainId.SMARTBCH_AMBER], 18, 'flexUSD', 'flexUSD')
}

export const WBCH: TokenMap = {
  [ChainId.SMARTBCH]: new Token(ChainId.SMARTBCH, WBCH_ADDRESS[ChainId.SMARTBCH], 18, 'WBCH', 'Wrapped BCH'),
  [ChainId.SMARTBCH_AMBER]: new Token(ChainId.SMARTBCH_AMBER, WBCH_ADDRESS[ChainId.SMARTBCH_AMBER], 18, 'WBCH', 'Wrapped BCH')
}

export const WNATIVE: TokenMap = {
  [ChainId.SMARTBCH]: WBCH[ChainId.SMARTBCH],
  [ChainId.SMARTBCH_AMBER]: WBCH[ChainId.SMARTBCH_AMBER]
}
