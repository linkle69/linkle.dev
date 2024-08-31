import { error, json } from '@sveltejs/kit'

const USER_ID = '476662199872651264'
const FRIEND_IDS = [
	{ id: '565197576026980365', url: 'https://instellate.xyz' },
	{ id: '585278686291427338', url: 'https://lumap.xyz' }
]

async function fetchUser(id: string) {
	let tempProfile: any = null
	const cachedProfile = sessionStorage.getItem(`avatar-${id}`)

	if (cachedProfile) {
		tempProfile = JSON.parse(cachedProfile)
	} else {
		tempProfile = await fetch(`https://discord.com/api/v10/users/${id}`, {
			headers: {
				Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
				'Content-Type': 'application/json'
			}
		}).then((res) => res.json())
		sessionStorage.setItem(`avatar-${id}`, JSON.stringify(tempProfile))
	}

	return tempProfile
}

export async function load() {
	const profile = await fetchUser(USER_ID)

	const friendProfiles = await Promise.all(
		FRIEND_IDS.map(async (friend) => {
			const friendProfile = await fetchUser(friend.id)
			return { ...friendProfile, url: friend.url }
		})
	)

	return {
		profile,
		friendProfiles
	}
}
