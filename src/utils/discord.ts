import { log } from './helpers'
import { DISCORD_TOKEN, DISCORD_CHANNEL } from '../config'
import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js'
import chalk from 'chalk'

let textChannel: TextChannel | undefined

export const startup = async () => {
    if (DISCORD_TOKEN === '' || DISCORD_CHANNEL === '') {
        log(chalk.red('Discord token or channel not set, not starting discord client'))
        return
    }
    const client = new Client({ intents: [GatewayIntentBits.Guilds] })

    client.once(Events.ClientReady, (c) => {
        log(chalk.green(`Ready! Logged in as ${c.user.tag}`))
        textChannel = c.channels.cache
            .filter((x) => x.type === 0)
            .find((x: any) => x.name === DISCORD_CHANNEL) as TextChannel
    })

    client.login(DISCORD_TOKEN)
}

export const sendMessage = async (message: string) => {
    if (textChannel) {
        // truncate message to 2000 characters for discord
        message = message.substring(0, 2000)
        await textChannel.send(message)
    }
}
