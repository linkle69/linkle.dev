import sharp from 'sharp'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { readFile, access } from 'fs/promises'
import path from 'node:path'

// Supported input extensions (order = preference if multiple exist)
const SUPPORTED_INPUT_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'tiff', 'avif', 'heic', 'svg']

async function fileExists(p) {
    try {
        await access(p)
        return true
    } catch {
        return false
    }
}

// Resolve an avatar path that might be given without an extension
async function resolveAvatarPath(hint) {
    const input = hint || process.argv[2] || process.env.AVATAR_PATH || './src/avatar'
    const hasExt = !!path.extname(input)

    if (hasExt) {
        if (await fileExists(input)) return input
        throw new Error(`Avatar not found at ${input}`)
    }

    for (const ext of SUPPORTED_INPUT_EXTS) {
        const candidate = `${input}.${ext}`
        if (await fileExists(candidate)) return candidate
    }

    throw new Error(
        `No avatar found. Tried: ${SUPPORTED_INPUT_EXTS.map((ext) => `${input}.${ext}`).join(', ')}`
    )
}

// Return a PNG buffer of the first renderable frame (handles animated GIF/WebP and SVG)
async function getFirstRenderableFrame(buffer) {
    const meta = await sharp(buffer, { animated: true }).metadata()
    const base =
        meta.pages && meta.pages > 1
            ? sharp(buffer, { animated: true }).extractFrame(0)
            : sharp(buffer)

    // For SVGs, you can tweak density for quality if needed
    const pngBuffer = await base.png().toBuffer()
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

    await sharp(pngBuffer).resize(size, size, { fit: 'cover' }).png().toFile('./public/favicon.png')
}

try {
    // Pass nothing to auto-detect ./src/avatar.{ext}
    // Or pass a path:
    //   node script.js ./src/my-avatar.jpg
    // Or via env:
    //   AVATAR_PATH=./src/my-avatar.webp node script.js
    const avatarPath = await resolveAvatarPath()
    const buffer = await readFile(avatarPath)

    await generateFaviconMax(buffer)
    await generateButton(buffer)
} catch (error) {
    console.error('Error generating assets:', error)
}
