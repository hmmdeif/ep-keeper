import * as crypto from 'node:crypto'
import * as os from 'node:os'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import chalk from 'chalk'
import { KEY } from '../config'
import { log } from './helpers'

const ALGORITHM = 'aes-256-gcm' // IV length of 12 (same as mac address without colons)
const KEY_FILE_NAME = 'key'

export interface AuthKey {
    authTag: string
    key: string
}

const getIV = (): Buffer => {
    const ni = os.networkInterfaces()
    let iv = ''

    if ('Ethernet' in ni) {
        iv = ni.Ethernet?.filter((x) => x.family === 'IPv4')[0].mac || ''
    }

    if ('eth0' in ni) {
        iv = ni.eth0?.filter((x) => x.family === 'IPv4')[0].mac || ''
    }

    if ('en0' in ni) {
        iv = ni.en0?.filter((x) => x.family === 'IPv4')[0].mac || ''
    }

    return Buffer.from(iv.replace(/:/g, ''))
}

export const encrypt = (text: string): AuthKey => {
    const cipher = crypto.createCipheriv(ALGORITHM, KEY.length > 32 ? KEY.substring(0, 32) : KEY, getIV())
    return {
        key: cipher.update(text, 'utf8', 'hex') + cipher.final('hex'),
        authTag: cipher.getAuthTag().toString('hex'),
    }
}

export const decrypt = (encrypted: string, authTag: string): string => {
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY.length > 32 ? KEY.substring(0, 32) : KEY, getIV())
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
}

export const saveKey = async (text: string): Promise<void> => {
    log(chalk.white('Saving encrypted private key to local file system'))
    const encrypted = encrypt(text)
    await fs.writeFile(path.join(__dirname, KEY_FILE_NAME), `${encrypted.key}|${encrypted.authTag}`)
    log(chalk.green('Key saved'))
}

export const getKey = async (): Promise<string> => {
    log(chalk.white('Getting private key from local file system'))
    try {
        const f = await fs.readFile(path.join(__dirname, KEY_FILE_NAME))
        log(chalk.green('Key found'))
        const s = f.toString('utf8').split('|')
        return decrypt(s[0], s[1])
    } catch {
        // console.error(e)
        log(chalk.yellow('Key not found, requires input'))
    }
    return ''
}
