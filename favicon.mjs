import sharp from 'sharp'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { readFile } from 'fs/promises'

// Helper: return a PNG buffer of the first renderable frame (handles animated GIF/WebP and vector)
async function getFirstRenderableFrame(buffer) {
    const meta = await sharp(buffer, { animated: true }).metadata()

    const base =
        meta.pages && meta.pages > 1
            ? sharp(buffer, { animated: true }).extractFrame(0)
            : sharp(buffer)

    const pngBuffer = await base.toFormat('png').toBuffer()
    return { pngBuffer, meta }
}

async function generateButton(buffer) {
    const width = 88
    const height = 31
    const backgroundColor = '#23272A'
    const textColor = 'white'
    const text = 'LINKLE'

    try {
        const { pngBuffer } = await getFirstRenderableFrame(buffer)

        const darkenedAvatarBuffer = await sharp(pngBuffer).linear(0.5, 0).png().toBuffer()

        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)

        const avatarImage = await loadImage(darkenedAvatarBuffer)
        ctx.globalAlpha = 0.8
        ctx.drawImage(avatarImage, 0, 0, width, height)
        ctx.globalAlpha = 1.0

        ctx.font = '16px Arial'
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

// Single, max-size favicon (512x512)
async function generateFaviconMax(srcBuffer) {
    const { pngBuffer } = await getFirstRenderableFrame(srcBuffer)
    const size = 512

    await sharp(pngBuffer).resize(size, size, { fit: 'cover' }).png().toFile('./public/favicon.png') // single file
}

try {
    // Input can be .png, .jpg/.jpeg, .webp, .gif (animated OK), .tiff, .avif, .heic, .svg, etc.
    const buffer = await readFile('./src/avatar.png')

    await generateFaviconMax(buffer)
    await generateButton(buffer)
} catch (error) {
    console.error('Error generating assets:', error)
}
