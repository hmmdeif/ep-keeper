export enum Network {
    fantom = 'fantom',
}

export enum ContractAddress {
    factoryRegistry = 'factoryRegistry',
}

export const addresses: { [key: string]: { [key: string]: string } } = {
    [Network.fantom]: {
        [ContractAddress.factoryRegistry]: '0x0',
    },
}
