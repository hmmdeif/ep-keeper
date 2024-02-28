import { JsonRpcProvider, Wallet } from 'ethers'
import { RPC } from '../config'

const provider: { [key: string]: JsonRpcProvider } = {}
let wallet: Wallet

export const getProvider = (network: string): JsonRpcProvider => {
    if (!(network in provider)) {
        provider[network] = new JsonRpcProvider(RPC[network])
    }
    return provider[network]
}

export const initWallet = (key: string, network: string): Wallet => {
    const walletPK = new Wallet(key)
    wallet = walletPK.connect(getProvider(network))
    return wallet
}

export const getWallet = (): Wallet => {
    return wallet
}
