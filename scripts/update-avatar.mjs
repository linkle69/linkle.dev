import { readFile, readdir, rm, writeFile } from 'fs/promises'
import { join } from 'path'

const srcDir = './src'
const hashFile = './.github/discord-avatar-hash'

const id = process.env.DISCORD_ID
const token = process.env.DISCORD_TOKEN

if (!id || !token) {
    console.error('Missing DISCORD_ID or DISCORD_TOKEN environment variable')
    process.exit(1)
}

const userResponse = await fetch(`https://discord.com/api/v10/users/${id}`, {
    headers: {
        Authorization: token.startsWith('Bot ') ? token : `Bot ${token}`
    }
})

if (!userResponse.ok) {
    console.error(`Failed to fetch Discord user: ${userResponse.status} ${await userResponse.text()}`)
    process.exit(1)
}

const user = await userResponse.json()

// Users without a custom avatar get one of Discord's default avatars
const avatarHash = user.avatar ?? `default-${(BigInt(id) >> 22n) % 6n}`
// Animated avatar hashes start with a_ and are kept as a GIF
const avatarExt = avatarHash.startsWith('a_') ? 'gif' : 'png'
const avatarFile = `avatar.${avatarExt}`
const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${id}/${user.avatar}.${avatarExt}?size=512`
    : `https://cdn.discordapp.com/embed/avatars/${(BigInt(id) >> 22n) % 6n}.png`

const files = await readdir(srcDir)
const currentAvatars = files.filter((file) => file.startsWith('avatar.'))
const storedHash = await readFile(hashFile, 'utf8').then((s) => s.trim(), () => null)

if (storedHash === avatarHash && currentAvatars.includes(avatarFile)) {
    console.log(`Avatar unchanged (${avatarHash})`)
    process.exit(0)
}

const avatarResponse = await fetch(avatarUrl)

if (!avatarResponse.ok) {
    console.error(`Failed to download avatar: ${avatarResponse.status}`)
    process.exit(1)
}

const buffer = Buffer.from(await avatarResponse.arrayBuffer())

// Only one avatar.* may exist in src/, the site picks up whichever it finds
for (const file of currentAvatars) {
    await rm(join(srcDir, file))
}

await writeFile(join(srcDir, avatarFile), buffer)
await writeFile(hashFile, `${avatarHash}\n`)

console.log(`Avatar updated (${storedHash ?? 'none'} -> ${avatarHash})`)
