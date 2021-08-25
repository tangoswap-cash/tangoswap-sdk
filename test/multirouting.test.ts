import { RConstantProductPool, RouteStatus } from '../src/types/MultiRouterTypes'

import { BigNumber } from '@ethersproject/bignumber'
import { findMultiRouting } from '../src/entities/MultiRouter'

const gasPrice = 1 * 200 * 1e-9

// Bridge:
//   /1\
// -0 | 3-
//   \2/

const price = [1, 1, 1, 1, 1]
const tokens = price.map((_, i) => ({
  name: '' + (i + 1),
  address: 'abcd'
}))

function getPool(t0: number, t1: number, reserve: number, fee = 0.003, imbalance = 0) {
  return new RConstantProductPool({
    token0: tokens[t0],
    token1: tokens[t1],
    address: `pool-${t0}-${t1}-${reserve}-${fee}`,
    reserve0: BigNumber.from(reserve),
    reserve1: BigNumber.from(Math.round(reserve / (price[t1] / price[t0]) - imbalance)),
    fee
  })
}

const testPool0_1 = getPool(0, 1, 1_000_000)
const testPool0_2 = getPool(0, 2, 1_00_000)
const testPool1_2 = getPool(1, 2, 1_000_000)
const testPool1_3 = getPool(1, 3, 1_00_000)
const testPool2_3 = getPool(2, 3, 1_000_000)

const testPools = [testPool0_1, testPool0_2, testPool1_3, testPool2_3, testPool1_2]

describe('Multirouting for bridge topology', () => {
  it('works correct', () => {
    const res = findMultiRouting(tokens[0], tokens[3], 10000, testPools, tokens[2], gasPrice)

    expect(res).toBeDefined()
    expect(res?.status).toEqual(RouteStatus.Success)
    expect(res?.legs.length).toEqual(testPools.length)
    expect(res?.legs[res.legs.length - 1].swapPortion).toEqual(1)
  })

  it('unknown gas price', () => {
    const res = findMultiRouting(tokens[0], tokens[3], 20000, testPools, tokens[4], gasPrice)

    expect(res).toBeDefined()
    expect(res?.status).toEqual(RouteStatus.Success)
    expect(res?.legs.length).toEqual(testPools.length)
    expect(res?.legs[res.legs.length - 1].swapPortion).toEqual(1)
  })

  it('not connected tokens', () => {
    const res = findMultiRouting(tokens[0], tokens[4], 20000, testPools, tokens[2], gasPrice)

    expect(res).toBeDefined()
    expect(res?.status).toEqual(RouteStatus.NoWay)
  })
})
