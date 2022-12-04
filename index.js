require('dotenv').config()
const axios = require("axios")
const sharp = require("sharp")
const {
    Client, SlashCommandBuilder, AttachmentBuilder, Events,
    ContextMenuCommandBuilder, ApplicationCommandType, 
    GatewayIntentBits: { Guilds, GuildMessages, MessageContent }
} = require('discord.js')
const options = { intents: [Guilds, GuildMessages, MessageContent ]}
const client = new Client(options)
client.on(Events.ClientReady, async () => {
    await client.guilds.cache.forEach(i => client.guilds.cache.get(i.id).commands.set([]))
    const commands = []
    commands.push(
        new SlashCommandBuilder()
            .setName('gif')
            .setDescription('convert image to gif')
            .addAttachmentOption(option => {
                option.setName('image')
                option.setDescription('Please attach an image')
                option.setRequired(true)
                return option
            }),
        new ContextMenuCommandBuilder()
            .setName('Picture to gif')
            .setType(ApplicationCommandType.Message)
    )
    client.user.setActivity({ name: 'png/jpg to gif' })
    await client.application.commands.set(commands)
})

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isCommand() && interaction.commandName == "gif") {
        await interaction.deferReply()
        const response = await axios.get(interaction.options.getAttachment('image').attachment, {
            responseType: 'arraybuffer'
        })
        const buffer = Buffer.from(response.data, 'base64')
        const pic = await sharp(buffer).gif().toBuffer()
        const attachment = new AttachmentBuilder(pic, {
            name: 'convert.gif'
        })
        await interaction.editReply({ files: [attachment] })
    }
    if (interaction.isCommand() && interaction.commandName == "Picture to gif") {
        await interaction.deferReply()
        const message  = interaction.targetMessage
        if(message.attachments.size == 0) {
            await interaction.editReply({
                content: 'image not found',
                ephemeral: false
            })
        } else {
            const item = message.attachments.entries().next().value[1]
            if (!item.height && !item.width) return;
            const response = await axios.get(item.attachment, {
                responseType: 'arraybuffer'
            })
            const buffer = Buffer.from(response.data, 'base64')
            const pic = await sharp(buffer).gif().toBuffer()
            const attachment = new AttachmentBuilder(pic, {
                name: 'convert.gif'
            })
            await interaction.editReply({ files: [attachment] })
        }
    }
})
client.login(process.env.token)