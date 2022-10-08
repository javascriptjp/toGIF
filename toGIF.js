const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js")
const axios = require("axios")
const sharp = require("sharp")
const crypto = require('crypto')
const fs = require("fs")
const { exec } = require('child_process')
const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const getRand = N => Array.from(crypto.randomFillSync(new Uint8Array(N))).map((n)=>S[n%S.length]).join('')

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
        data.addBooleanOption(option=>{
            option.setName("rembg")
            option.setDescription("Remove Background?")
            return option
        })
        return data
    })(),
    async execute(interaction) {
        await interaction.deferReply()
        if(interaction.options.getBoolean('rembg')){
            const response = await axios.get(interaction.options.getAttachment('image').attachment,{responseType: "arraybuffer"})
            const buffer = Buffer.from(response.data, "base64")
            const name = `${getRand(16)}.gif`
            const path = `${__dirname}/temp`
            await sharp(buffer).gif().toFile(`temp/${name}`)
            exec(`rembg i ${path}/${name} ${path}/Output_${name}`, async (err,std,strerr) => {
                const buffer = Buffer.from(fs.readFileSync(`${path}/Output_${name}`))
                const attachment = await new AttachmentBuilder(buffer, { name: 'convert.gif' })
                interaction.editReply({files: [attachment]})
                setTimeout(()=>{
                    fs.unlinkSync(`${path}/${name}`)
                    fs.unlinkSync(`${path}/Output_${name}`)
                }, 1000 * 30)
            })
        }else{
            const response = await axios.get(interaction.options.getAttachment('image').attachment,{responseType: "arraybuffer"})
            const buffer = Buffer.from(response.data, "base64")
            const pic = await sharp(buffer).gif().toBuffer()
            const attachment = new AttachmentBuilder(pic, { name: 'convert.gif' })
            await interaction.editReply({files: [attachment]})
        }
    }
}