import sharp from 'sharp'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { readFile } from 'fs/promises'

async function generateButton(buffer) {
    const width = 88
    const height = 31
    const backgroundColor = '#23272A'
    const textColor = 'white'
    const text = 'LINKLE'

    try {
        const darkenedAvatarBuffer = await sharp(buffer)
            .linear(0.5, 0)
            .toBuffer()

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

try {
    const buffer = await readFile('./src/avatar.png')
    const sizes = [16, 32, 48, 64, 96, 192]

    await Promise.all(
        sizes.map(async (size) => {
            await sharp(buffer)
                .resize(size, size)
                .toFile(`./public/favicon-${size}.png`)
        })
    )

    await generateButton(buffer)
} catch (error) {
    console.error('Error generating assets:', error)
}
