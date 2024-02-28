import chalk from 'chalk'

import * as factoryRegistryAbi from './abis/FactoryRegistry.json'

import { ContractAddress, Network } from './network/addresses'
import { initWallet } from './network/wallet'
import { getContract } from './network/contract'
import { getKey, saveKey } from './utils/crypto'
import { sendMessage, startup } from './utils/discord'
import { getTimeStamp, log, prompt, sleep } from './utils/helpers'
import { IFactoryRegistry } from './interfaces/IFactoryRegistry'
import { PROXY_OWNER } from 'config'
import { ZeroAddress } from 'ethers'
import { mineTx } from './utils/transaction'

;(async () => {
    log(chalk.bold.bgYellow(`Estfor Plaza Keeper Starting`))
    await startup()
    const r = 60000 * 10 // 10 minutes

    while (true) { // eslint-disable-line no-constant-condition
        try {
            let key = await getKey()
            if (key === '') {
                key = await prompt('Enter your private key: ')
                await saveKey(key)
            }

            if (PROXY_OWNER === '') {
                log(chalk.red('PROXY_OWNER not set'))
                return
            }

            const n = Network.fantom
            await initWallet(key, n)

            const contract = getContract(ContractAddress.factoryRegistry, factoryRegistryAbi, n) as IFactoryRegistry

            let i = 0
            const proxies = []
            let moreProxies = true
            while (moreProxies) {
                const proxy = await contract.proxyAddressOfOwnerByIndex(PROXY_OWNER, i)
                if (proxy === ZeroAddress) {
                    moreProxies = false
                } else {
                    proxies.push(proxy)
                    i++
                }
            }
            log(chalk.bgGreen('Proxies: ' + proxies.length))

            for (const proxy of proxies) {
                // TODO: Check proxy action queue for time left (execute if empty or <1 hour left)

                await mineTx(n, 5000000, BigInt(0), contract.executeSavedTransactions, proxy)
            }

            log(chalk.bgGreen('Loop finished'))
        } catch (e: any) {
            log(chalk.bold.bgRed('ERROR OCCURRED - CHECK LOG'))
            console.error(`${getTimeStamp()} ERROR LOGGED`)
            console.error(e)
            await sendMessage(`:crab: **ERROR OCCURRED** - ${e.message}`)
        } finally {
            log(chalk.gray(`Waiting for ${r / 1000} seconds...`))
            await sleep(r)
        }
    }
})()
