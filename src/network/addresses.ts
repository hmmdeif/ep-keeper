export enum Network {
    fantom = 'fantom',
}

export enum ContractAddress {
    factoryRegistry,
}

export const addresses: { [key: string]: { [key: string]: string } } = {
    [Network.fantom]: {
        [ContractAddress.factoryRegistry]: '0xF9A66F8C569D23f1fA1A63950c3CA822Cf26355e',
    },
}
