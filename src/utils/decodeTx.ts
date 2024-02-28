import { Interface } from 'ethers'
import { getProvider } from '../network/wallet'

export const decodeTx = async (network: string, txHash: string, abi: any): Promise<void> => {
    const tx = await getProvider(network).getTransaction(txHash)

    const iface = new Interface(abi.default)
    const data = iface.parseTransaction({ data: tx.data, value: tx.value })
    console.log(data)
}
