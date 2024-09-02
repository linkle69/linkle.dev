const USER_ID = '476662199872651264'
const FRIEND_IDS = [
	{ id: '565197576026980365', url: 'https://instellate.xyz' },
	{ id: '585278686291427338', url: 'https://lumap.xyz' }
]

let cache = {
	userProfile: null,
	friendProfiles: []
}

async function fetchUser(id: any) {
	const response = await fetch(`https://discord.com/api/v10/users/${id}`, {
		headers: {
			Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
			'Content-Type': 'application/json'
		}
	})

	const data = await response.json()
	const avatarExtension = data.avatar.startsWith('a_') ? 'gif' : 'webp'

	data.avatar_url = `https://cdn.discordapp.com/avatars/${id}/${data.avatar}.${avatarExtension}?size=4096`

	if (data.banner) {
		const bannerExtension = data.banner.startsWith('a_') ? 'gif' : 'webp'
		data.banner_url = `https://cdn.discordapp.com/banners/${id}/${data.banner}.${bannerExtension}?size=4096`
	}

	return data
}

function clearCache() {
	cache.userProfile = null
	cache.friendProfiles = []
}

setInterval(clearCache, 3600000)

export async function load() {
	if (!cache.userProfile) {
		cache.userProfile = await fetchUser(USER_ID)
	}

	if (cache.friendProfiles.length === 0) {
		for (const friend of FRIEND_IDS) {
			const friendProfile = await fetchUser(friend.id)
			// @ts-ignore
			cache.friendProfiles.push({ ...friendProfile, url: friend.url })
		}
	}

	return {
		userProfile: cache.userProfile,
		friendProfiles: cache.friendProfiles
	}
}
