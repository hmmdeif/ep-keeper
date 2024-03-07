import { BaseContract } from 'ethers'

export interface EPTransaction {
    to: string
    data: any
}

export interface IEPProxy extends BaseContract {
    getAllSavedTransactions(): Promise<EPTransaction[]>
    isPaused(): Promise<boolean>
}
