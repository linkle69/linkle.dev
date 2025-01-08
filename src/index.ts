import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import redis, { commandOptions } from 'redis'
import fs from 'fs/promises'
import * as cheerio from 'cheerio'

const ttl = process.env.TTL ? parseInt(process.env.TTL) : 5 * 60
const port = process.env.PORT || 3000

if (!process.env.DISCORD_TOKEN) {
    console.error('DISCORD_TOKEN is not defined')
    process.exit(1)
}

const client = redis.createClient({ url: 'redis://redis' })
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

new Elysia()
    .use(cors({ origin: 'https://linkdiscord.xyz' }))
    .use(
        staticPlugin({
            assets: 'src/public',
            prefix: '/'
        })
    )
    .get('/', async ({ set }) => {
        const [user, file] = await Promise.all([
            fetchUser(id),
            fs.readFile('src/public/index.html', 'utf8')
        ])

        const $ = cheerio.load(file)
        const accent_color = user.accent_color.toString(16).padStart(6, '0')

        $('head').append(`<meta name="theme-color" content="#${accent_color}">`)

        set.headers['Content-Type'] = 'text/html'
        return $.html()
    })
    .get('/favicon.png', async ({ set }) => {
        const user = await fetchUser(id)
        let buffer = await client.get(commandOptions({ returnBuffers: true }), 'favicon')

        if (!buffer) {
            const data = await fetch(
                `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
            )

            if (!data.ok) {
                set.status = 500
                return
            }

            buffer = Buffer.from(await data.arrayBuffer())
            await client.set('favicon', buffer, { EX: ttl })
        }

        set.headers['Content-Type'] = 'image/png'
        return buffer
    })
    .get('/avatar/:id', async ({ params, query, set }) => {
        const user = await fetchUser(params.id)
        const size = query.size || 128
        const is_animated = user.avatar.startsWith('a_')
        const extension = is_animated ? 'gif' : 'webp'

        set.headers['Content-Type'] = `image/${extension}`
        set.status = 302
        set.headers.Location = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=${size}`
        return
    })
    .get('/banner/:id', async ({ params, query, set }) => {
        const user = await fetchUser(params.id)
        const size = query.size || 128
        const hasBanner = user.banner !== null

        if (!hasBanner) {
            set.status = 404
            return
        }

        const extension = user.banner ? 'png' : 'webp'

        set.headers['Content-Type'] = `image/${extension}`
        set.status = 302
        set.headers.Location = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${extension}?size=${size}`
        return
    })
    .get('/color/:id', async ({ params, set }) => {
        const user = await fetchUser(params.id)

        if (!user.accent_color) {
            set.status = 404
            return
        }

        const accent_color = user.accent_color.toString(16).padStart(6, '0')
        return `#${accent_color}`
    })
    .get('/user/:id', ({ params }) => fetchUser(params.id))
    .listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
