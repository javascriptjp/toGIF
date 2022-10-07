require("dotenv").config()
const {Client, GatewayIntentBits:{Guilds, GuildMessages, MessageContent}} = require("discord.js")
const fs = require("fs")
const options = {intents: [Guilds, GuildMessages, MessageContent]}
const client = new Client(options)
const commands = {}
client.on("ready",async () => {
    await client.guilds.cache.forEach(i=>client.guilds.cache.get(i.id).commands.set([]))
    const commandFiles = ["toGIF.js"]
    const data = []
    for (const file of commandFiles) {
        const command = require(`./${file}`);
        commands[command.data.name] = command
    }
    for (const commandName in commands) data.push(commands[commandName].data)
    await client.application.commands.set(data);
})

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {return}
    const command = commands[interaction.commandName]
    try { await command.execute(interaction)
    } catch (error) {
        await interaction.reply({content: 'エラーが発生しました', ephemeral: true,})
    }
})
client.login(process.env.token)