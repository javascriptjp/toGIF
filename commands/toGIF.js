const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js")
const axios = require("axios")
const sharp = require("sharp")
module.exports = {
    data: (() => {
        const data = new SlashCommandBuilder()
        data.setName('gif')
        data.setDescription('convert image to gif')
        data.addAttachmentOption(option=>{
            option.setName('image')
			option.setDescription('Please attach an image')
			option.setRequired(true)
            return option
        })
        return data
    })(),
    async execute(interaction) {
        await interaction.deferReply()
        const response = await axios.get(interaction.options.getAttachment('image').attachment,{responseType: "arraybuffer"})
        const buffer = Buffer.from(response.data, "base64")
        const pic = await sharp(buffer).gif().toBuffer()
        const attachment = new AttachmentBuilder(pic, { name: 'convert.gif' })
        await interaction.editReply({files: [attachment]})
    }
}