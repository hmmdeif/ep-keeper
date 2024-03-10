import { BaseContract, Transaction } from 'ethers'

export interface IFactoryRegistry extends BaseContract {
    executeSavedTransactions(proxy: string): Promise<Transaction>
    proxyAddressOfOwnerByIndex(owner: string, index: number): Promise<string>
    totalAddressCount(): Promise<bigint>
}
