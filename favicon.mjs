import sharp from 'sharp'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'

async function generateButton(buffer) {
    const width = 88
    const height = 31
    const backgroundColor = '#23272A'
    const textColor = 'white'
    const text = 'LINKLE'

    try {
        const darkenedAvatarBuffer = await sharp(buffer).linear(0.5, 0).toBuffer()

        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)

        const avatarImage = await loadImage(darkenedAvatarBuffer)

        ctx.globalAlpha = 0.8
        ctx.drawImage(avatarImage, 0, 0, width, height)
        ctx.globalAlpha = 1.0
        ctx.font = '16px arial'
        ctx.fillStyle = textColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, width / 2, height / 2)

        const buttonBuffer = canvas.toBuffer('image/png')
        await sharp(buttonBuffer).toFile('./public/button.png')

        return buttonBuffer
    } catch (error) {
        console.error('Error generating button:', error)
        throw error
    }
}

async function findAvatar() {
    const srcDir = './src'
    const files = await readdir(srcDir)
    const avatarFile = files.find(file => file.startsWith('avatar.'))
    
    if (!avatarFile) {
        throw new Error('No avatar file found in src/ (expected avatar.png, avatar.gif, avatar.webp, etc.)')
    }
    
    return join(srcDir, avatarFile)
}

try {
    const avatarPath = await findAvatar()
    const buffer = await readFile(avatarPath)
    
    const metadata = await sharp(buffer).metadata()
    const hasAlpha = metadata.hasAlpha
    
    await sharp(buffer, { animated: true })
        .resize(512, 512)
        .png({ quality: 100 })
        .toFile(`./public/favicon.png`)
    
    await generateButton(buffer)
} catch (error) {
    console.error('Error generating assets:', error)
}
