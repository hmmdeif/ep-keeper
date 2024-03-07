import chalk from 'chalk'
import { ZeroAddress } from 'ethers'

import * as factoryRegistryAbi from './abis/IFactoryRegistry.json'
import * as epProxyAbi from './abis/IEPProxy.json'

import { ContractAddress, Network } from './network/addresses'
import { initWallet } from './network/wallet'
import { getContract } from './network/contract'

import { getPlayersByOwner, searchQueuedActions } from './utils/api'
import { getKey, saveKey } from './utils/crypto'
import { sendMessage, startup } from './utils/discord'
import { getTimeStamp, log, prompt, sleep } from './utils/helpers'
import { mineTx } from './utils/transaction'

import { IFactoryRegistry } from './interfaces/IFactoryRegistry'
import { IEPProxy } from './interfaces/IEPProxy'
import { PROXY_OWNER } from './config'
;(async () => {
    log(chalk.bold.bgYellow(`Estfor Plaza Keeper Starting`))
    await startup()
    const r = 60000 * 10 // 10 minutes

    // eslint-disable-next-line no-constant-condition
    while (true) {
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
            log(chalk.yellow('Proxies owned: ' + proxies.length))
            const now = Date.now() / 1000

            for (const proxy of proxies) {
                const proxyContract = getContract(proxy, epProxyAbi, n) as IEPProxy
                const savedTransactions = await proxyContract.getAllSavedTransactions()
                if (savedTransactions.length === 0) {
                    log(chalk.gray(`Proxy ${proxy} has no saved transactions, skipping...`))
                    continue
                }

                const paused = await proxyContract.isPaused()
                if (paused) {
                    log(chalk.gray(`Proxy ${proxy} is paused, skipping...`))
                    continue
                }

                const playerResult = await getPlayersByOwner(proxy)
                const player = playerResult.players.find((x) => x.isActive)
                if (!player) {
                    log(chalk.gray(`Proxy ${proxy} has no active hero, skipping...`))
                }

                log(chalk.gray(`Proxy ${proxy} - Player: ${player.id} - ${player.name}`))

                const queuedActions = await searchQueuedActions(player.id)
                if (queuedActions.queuedActions.length > 0) {
                    const endTime = queuedActions.queuedActions.reduce(
                        (acc, x) => acc + x.timespan,
                        parseInt(queuedActions.queuedActions[0].startTime),
                    )

                    // If there are no queued actions or the end time is less than 1 hour away
                    if (endTime > now + 3600) {
                        log(
                            chalk.gray(
                                `Proxy ${proxy} actions end at ${new Date(endTime * 1000).toLocaleString()}, skipping...`,
                            ),
                        )
                        continue
                    }
                }

                const gasLimit = await contract['executeSavedTransactions(address)'].estimateGas(proxy)

                await mineTx(n, gasLimit, BigInt(0), contract.executeSavedTransactions, proxy)
                await sendMessage(`:pick: **Executed saved transactions for ${player.name}**`)
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
