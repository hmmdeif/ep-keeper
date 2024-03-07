# Estfor Plaza Keeper

Keeper bot to run against your Estfor Plaza Proxies

## Install

[Download NodeJS](https://nodejs.org/en/download)

In the terminal run the following commands:

`npm i -g yarn`
`yarn install`

## Run

Copy and paste `.env.sample` and rename to `.env`. Fill in discord token, discord channel, and key variables (`KEY` can be anything as long as it's >=32 characters, it's used as a partial encryption key).

**PLEASE CREATE A SEPARATE WALLET AND USE THAT PRIVATE KEY!!** Only fill that wallet with gas and nothing else. The keeper does nothing except execute transactions.

`yarn build`
`yarn start`

If key file (which stores your private key) doesn't exist you need to attach pm2 to the process in order for readline to work:

`npm i -g pm2`
`pm2 list`
`pm2 attach id`

Alternatively run

`yarn dev`

Then copy the `key` file that gets generated in `src/utils/` to `dist/utils`. Then run the first commands again.

## Discord Notifications

The keeper will provide updates to discord if you enter in the details. I would recommend creating your own Discord server
and a channel specifically for the keeper bot to send messages. You will need to create a Discord Application so that the keeper
can connect to discord. The keeper will also log to the console if you don't want it to send messages to discord.

### Create Discord Application

`https://discord.com/developers/applications`

New Application -> Set name

Sidebar -> Bot -> Reset Token -> Copy token -> Paste into `.env`

Sidebar -> General Information -> Copy Application Id

Replace `YOUR_APPLICATION_ID` in the following link with the actual Application Id you just copied.

`https://discord.com/api/oauth2/authorize?client_id=YOUR_APPLICATION_ID&permissions=0&scope=bot`

Paste the url into a browser and authorise the bot to join the server.
