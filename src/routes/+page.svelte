<script lang="ts">
	import Icon from '@iconify/svelte'
	import { Avatar } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'

	const USER_ID = '476662199872651264'

	let profile: any = null

	async function getProfile() {
		const avatarURL = await fetch(`https://discordlookup.mesalytic.moe/v1/user/${USER_ID}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		return avatarURL.json()
	}

	onMount(async () => {
		const cachedProfile = sessionStorage.getItem(`avatar-${USER_ID}`)

		if (cachedProfile) {
			profile = JSON.parse(cachedProfile)
		} else {
			profile = await getProfile()
			sessionStorage.setItem(`avatar-${USER_ID}`, JSON.stringify(profile))
		}
	})
</script>

<div class="flex justify-center items-center h-screen">
	{#if profile}
		<div class="flex flex-col items-center">
			<Avatar src={profile.avatar.link} class="w-32 rounded-full" />
			<div class="flex flex-row items-center">
				<h1 class="h1 font-bold my-2">{profile.global_name}</h1>
				<h3 class="h3 ml-3 font-bold text-secondary-500">@{profile.username}</h3>
			</div>
			<img src={profile.banner.link} class="w-256 h-32 rounded-lg mt-2" alt="Banner" />
			<h3 class="h3 my-4 font-bold">About Me</h3>
			<div class="block card card-hover p-4 ">
				<p>Im German and I like to code and play games</p><br>
				<p>I play: HSR + Fortnite + Minecraft and Persona Games</p><br>
				<p>Honkai Star Rail UID: 700477503</p>
			</div>
			<h3 class="h3 my-4 font-bold">Socials</h3>
			<div class="flex flex-row items-center">
				<a href="https://x.com/link0069" class="btn variant-filled mx-1">
					<span><Icon icon="bxl:twitter" width="24px" height="24px" /></span>
					<span>Twitter</span>
				</a>
				<a href="https://github.com/link-discord" class="btn variant-filled mx-1">
					<span><Icon icon="bxl:github" width="24px" height="24px" /></span>
					<span>Github</span>
				</a>
				<a
					href="https://steamcommunity.com/profiles/76561199084755219"
					class="btn variant-filled mx-1"
				>
					<span><Icon icon="bxl:steam" width="24px" height="24px" /></span>
					<span>Steam</span>
				</a>
			</div>
		</div>
	{:else}
		<h1 class="h1 font-bold text-pre">Loading...</h1>
	{/if}
</div>

<footer class="text-white py-4 mt-8">
	<div class="container mx-auto text-center">
		<h2 class="h2 font-bold">Footer Section</h2>
	</div>
</footer>
