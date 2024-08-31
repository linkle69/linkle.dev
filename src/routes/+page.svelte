<script lang="ts">
	import Icon from '@iconify/svelte'
	import { Avatar } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'

	const USER_ID = '476662199872651264'
	const FRIEND_IDS = [
		{ id: '565197576026980365', url: 'https://instellate.xyz' },
		{ id: '585278686291427338', url: 'https://lumap.xyz' }
	]

	let isLoading = true
	let profile: any = null
	let friendProfiles: any[] = []

	async function fetchUser(id: string) {
		let tempProfile: any = null
		const cachedProfile = sessionStorage.getItem(`avatar-${id}`)

		if (cachedProfile) {
			tempProfile = JSON.parse(cachedProfile)
		} else {
			tempProfile = await fetch(`https://discordlookup.mesalytic.moe/v1/user/${id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}).then((res) => res.json())
			sessionStorage.setItem(`avatar-${id}`, JSON.stringify(tempProfile))
		}

		return tempProfile
	}

	onMount(async () => {
		console.log('Fetching user profile...')

		profile = await fetchUser(USER_ID)

		for (const friend of FRIEND_IDS) {
			console.log(`Fetching friend profile: ${friend}`)
			const friendProfile = await fetchUser(friend.id)
			friendProfiles.push({ ...friendProfile, url: friend.url })
		}

		isLoading = false
	})
</script>

{#if !isLoading}
	<div class="flex flex-col justify-center items-center h-screen min-h-screen overflow-auto">
		<Avatar src={profile.avatar.link} class="w-32 h-32 min-w-32 min-h-32 rounded-full" />
		<div class="flex flex-row items-center">
			<h1 class="h1 font-bold my-2">{profile.global_name}</h1>
			<h3 class="h3 ml-3 font-bold text-secondary-500">@{profile.username}</h3>
		</div>
		<img src={profile.banner.link} class="w-256 h-32 rounded-lg mt-2" alt="Banner" />
		<h3 class="h3 my-4 font-bold">About Me</h3>
		<div class="block card card-hover p-4 mx-4">
			<p>Im German and I like to code and play games</p>
			<br />
			<p>I play: HSR + Fortnite + Minecraft and Persona Games</p>
			<br />
			<p>Honkai Star Rail UID: 700477503</p>
		</div>
		<h3 class="h3 my-4 font-bold">Socials</h3>
		<div class="grid grid-flow-col gap-2 items-center">
			<a href="https://x.com/link0069" class="btn variant-filled">
				<span><Icon icon="bxl:twitter" width="24px" height="24px" /></span>
				<span>Twitter</span>
			</a>
			<a href="https://github.com/link-discord" class="btn variant-filled">
				<span><Icon icon="bxl:github" width="24px" height="24px" /></span>
				<span>Github</span>
			</a>
			<a
				href="https://steamcommunity.com/profiles/76561199084755219"
				class="btn variant-filled"
			>
				<span><Icon icon="bxl:steam" width="24px" height="24px" /></span>
				<span>Steam</span>
			</a>
		</div>
		<h3 class="h3 font-bold my-4">Friends</h3>
		<div class="grid grid-flow-col gap-4">
			{#each friendProfiles as friend}
				{#if friend.url}
					<a href={friend.url} target="_blank" rel="noopener noreferrer">
						<Avatar src={friend.avatar.link} class="w-16 rounded-full" />
					</a>
				{:else}
					<Avatar src={friend.avatar.link} class="w-16 rounded-full" />
				{/if}
			{/each}
		</div>
	</div>
{:else}
	<div class="flex flex-col justify-center items-center h-screen">
		<h1 class="h1 font-bold text-pre">Loading...</h1>
	</div>
{/if}
