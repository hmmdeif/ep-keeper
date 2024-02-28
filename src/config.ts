import 'dotenv/config'
import { Network } from './network/addresses'

export const ENV = process.env.ENVIRONMENT || 'fantom'
export const KEY = process.env.KEY || ''
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || ''
export const DISCORD_CHANNEL = process.env.DISCORD_CHANNEL || ''
export const MAX_GAS_PRICE = process.env.MAX_GAS_PRICE || '100'
export const PROXY_OWNER = process.env.PROXY_OWNER || ''

export const RPC: { [key: string]: string } = {
    [Network.fantom]: `https://rpc.ftm.tools/`,
}
