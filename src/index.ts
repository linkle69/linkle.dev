import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import * as cheerio from 'cheerio'
import redis, { commandOptions } from 'redis'

const ttl = process.env.TTL ? parseInt(process.env.TTL) : 5 * 60
const port = process.env.PORT || 3000

if (!process.env.DISCORD_TOKEN) {
    console.error('DISCORD_TOKEN is not defined')
    process.exit(1)
}

const client = redis.createClient({ url: 'redis://redis' })
const app = express()
const id = '476662199872651264'

await client.connect()

async function fetchUser(id: string) {
    const cachedUser = await client.get(id)

    if (cachedUser) return JSON.parse(cachedUser)

    const data = await fetch(`https://discord.com/api/v9/users/${id}`, {
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`
        }
    })

    if (!data.ok) return null

    const user = await data.json()

    await client.set(id, JSON.stringify(user), { EX: ttl })

    return user
}

app.use(cors({ origin: 'https://linkdiscord.xyz' }))

app.get('/', async (req, res) => {
    const [user, file] = await Promise.all([
        fetchUser(id),
        fs.readFile('src/public/index.html', 'utf8')
    ])

    const $ = cheerio.load(file)
    const accent_color = user.accent_color.toString(16).padStart(6, '0')

    $('head').append(`<meta name="theme-color" content="#${accent_color}">`)

    res.send($.html())
})

app.use(express.static('src/public', { extensions: ['css', 'js'] }))

app.get('/favicon.png', async (req, res) => {
    const user = await fetchUser(id)
    let buffer = await client.get(commandOptions({ returnBuffers: true }), 'favicon')

    if (!buffer) {
        const data = await fetch(
            `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
        )

        if (!data.ok) {
            res.sendStatus(500)
            return
        }

        buffer = Buffer.from(await data.arrayBuffer())
        await client.set('favicon', buffer, { EX: ttl })
    }

    res.contentType('image/png')
    res.send(buffer)
})

app.get('/avatar/:id', async (req, res) => {
    const id = req.params.id
    const size = req.query.size || 128
    const user = await fetchUser(id)
    const is_animated = user.avatar.startsWith('a_')
    const extension = is_animated ? 'gif' : 'webp'

    res.contentType(`image/${extension}`)
    res.redirect(
        `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=${size}`
    )
})

app.get('/color/:id', async (req, res) => {
    const id = req.params.id
    const user = await fetchUser(id)
    const accent_color = user.accent_color.toString(16).padStart(6, '0')

    res.send(`#${accent_color}`)
})

app.get('/user/:id', async (req, res) => {
    const id = req.params.id
    const user = await fetchUser(id)

    res.json(user)
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
