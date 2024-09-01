import { error } from '@sveltejs/kit'
import { json } from '@sveltejs/kit'

let cache: any = {}

export const GET = async ({ url }) => {
	const id = String(url.searchParams.get('id'))

	if (!id) {
		return error(400, 'Invalid request')
	}

	if (cache[id]) {
		return json(cache[id])
	}

	const data = await fetch(`https://discord.com/api/v10/users/${id}`, {
		headers: {
			Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
			'Content-Type': 'application/json'
		}
	}).then((res) => res.json())

	const avatarExtension = data.avatar.startsWith('a_') ? 'gif' : 'webp'
	data.avatar_url = `https://cdn.discordapp.com/avatars/${id}/${data.avatar}.${avatarExtension}?size=4096`

	if (data.banner) {
		const bannerExtension = data.banner.startsWith('a_') ? 'gif' : 'webp'
		data.banner_url = `https://cdn.discordapp.com/banners/${id}/${data.banner}.${bannerExtension}?size=4096`
	}

	cache[id] = data

	return json(data)
}
