import chalk from 'chalk'
import * as readline from 'node:readline'
import { stdin as input, stdout as output } from 'node:process'

export const ADDRESS_NULL = '0x0000000000000000000000000000000000000000'

export const getTimeStamp = () => {
    const d = new Date()
    return `[${padDateTime(d.getDate())}/${padDateTime(
        d.getMonth() + 1,
    )}/${d.getFullYear()} ${padDateTime(d.getHours())}:${padDateTime(d.getMinutes())}:${padDateTime(d.getSeconds())}]`
}

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export const sleepRandomSeconds = async () => {
    const r = getRandomInt(3000, 8000)
    log(chalk.gray(`Waiting for ${r / 1000} seconds...`))
    await sleep(r)
}

export const padDateTime = (n: number): string => {
    return n.toString().padStart(2, '0')
}

export const log = (msg: string) => {
    console.log(`${chalk.gray(getTimeStamp())} ${msg}`)
}

export const prompt = (question: string): Promise<string> => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input, output })
        rl.question(question, (answer) => {
            resolve(answer)
            rl.close()
        })
    })
}
