import sharp from 'sharp'

const id = '476662199872651264'
const token = process.env.DISCORD_TOKEN

if (!token) {
    console.error('Missing DISCORD_TOKEN environment variable')
    process.exit(1)
}

try {
    const start = process.hrtime.bigint()
    const userResponse = await fetch(`https://discord.com/api/v10/users/${id}`, {
        headers: {
            Authorization: `Bot ${token}`
        }
    })

    if (!userResponse.ok) throw new Error('Failed to fetch user')

    const user = await userResponse.json()
    const avatar = user.avatar
    const response = await fetch(`https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=256`)

    if (!response.ok) throw new Error('Failed to fetch avatar')

    const buffer = await response.arrayBuffer()
    const sizes = [16, 32, 48, 64, 96, 192]

    await Promise.all(
        sizes.map(async (size) => {
            await sharp(Buffer.from(buffer))
                .resize(size, size)
                .toFile(`./public/favicon-${size}.png`)
        })
    )

    const time = Number(process.hrtime.bigint() - start) / 1e6
    console.log(`Generated assets in ${Math.floor(time)}ms`)
} catch (error) {
    console.error('Error generating assets:', error)
}
