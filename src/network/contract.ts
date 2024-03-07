import chalk from 'chalk'
import { BaseContract, Interface } from 'ethers'
import { addresses, ContractAddress } from './addresses'
import { getWallet } from './wallet'
import { log } from '../utils/helpers'

export const getContract = (address: ContractAddress | string, abi: any, network: string): BaseContract | null => {
    if (!(network in addresses)) {
        log(chalk.red(`${network} is not a valid Network type (should be mainnet or testnet)`))
    }

    if (typeof address === 'string') {
        return new BaseContract(address, new Interface(abi.default), getWallet())
    }

    if (!(address in addresses[network])) {
        log(chalk.red(`${address} is not a valid Contract Address (it could be missing)`))
        return null
    }

    return new BaseContract(addresses[network][address], new Interface(abi.default), getWallet())
}
