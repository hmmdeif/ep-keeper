import chalk from 'chalk'
import { Overrides, Transaction, parseUnits } from 'ethers'
import { getProvider } from '../network/wallet'
import { log, sleep } from './helpers'
import { MAX_GAS_PRICE } from 'config'

const DEFAULT_BASE_FEE = parseUnits('10', 'gwei') // 10 gwei
const DEFAULT_PRIORITY_FEE = parseUnits('1', 'gwei') // 1 gwei
const MAX_ACCEPTABLE_TX_COST = parseUnits('0.5', 'ether') // 0.5 ftm

const calcGasFee = (network: string, baseFeePerGas: bigint | null | undefined) => {
    return ((baseFeePerGas || DEFAULT_BASE_FEE) * BigInt(1125)) / BigInt(1000)
}

const waitForMine = async (
    network: string,
    override: Overrides,
    func: (...rest: any[]) => Promise<Transaction>,
    ...args: any[]
) => {
    const provider = getProvider(network)
    let tx = await func(...args, override)
    let receipt = null
    const e = new Date()
    e.setSeconds(e.getSeconds() + 15)

    while (receipt == null) {
        receipt = await provider.getTransaction(tx.hash || '')

        if (receipt === null) {
            if (e < new Date()) {
                const block = await provider.getBlock(-1)
                const newGasFee = calcGasFee(network, block.baseFeePerGas) + BigInt(DEFAULT_PRIORITY_FEE)
                log(
                    chalk.gray(
                        `Tx not mined with base fee ${override.maxFeePerGas?.toString()}, retrying with ${newGasFee.toString()}`,
                    ),
                )
                override.nonce = tx.nonce
                override.maxFeePerGas = newGasFee
                tx = await func(...args, override)
                e.setSeconds(e.getSeconds() + 15)
            }
            await sleep(2000)
        }
    }

    log(chalk.gray(`Tx mined with base fee ${override.maxFeePerGas?.toString()}`))
    let success = false
    try {
        const r = await receipt.wait()
        success = r.status === 1
    } catch (e) {
        success = false
    }
    return success
}

export const mineTx = async (
    network: string,
    gasLimit: number,
    value: bigint,
    func: (...rest: any[]) => Promise<Transaction>,
    ...args: any[]
): Promise<boolean> => {
    const provider = getProvider(network)
    const block = await provider.getBlock(-1)
    const override: Overrides = {
        maxFeePerGas: calcGasFee(network, block.baseFeePerGas) + BigInt(DEFAULT_PRIORITY_FEE),
        maxPriorityFeePerGas: DEFAULT_PRIORITY_FEE,
        gasLimit: gasLimit,
        value,
    }
    if (
        BigInt(block.baseFeePerGas) * BigInt(gasLimit) > BigInt(MAX_ACCEPTABLE_TX_COST) ||
        BigInt(override.maxFeePerGas) > parseUnits(MAX_GAS_PRICE, 'gwei')
    ) {
        log(
            chalk.red(`Tx cost too high, not sending`) +
                ' ' +
                chalk.grey(
                    `Current: ${override.maxFeePerGas?.toString()} Max: ${parseUnits(MAX_GAS_PRICE, 'gwei').toString()}`,
                ),
        )
        return false
    }
    return await waitForMine(network, override, func, ...args)
}
