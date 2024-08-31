<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'

	const USER_ID = '476662199872651264'

	let profile: any = null

	async function getProfile() {
		const avatarURL = await fetch(
			`https://discordlookup.mesalytic.moe/v1/user/${USER_ID}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		)

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
			<div class="bg-surface-500 mt-4 px-4 pb-4 rounded-lg">
				<p class="mt-4">Im German and I like to code and play games</p>
				<a class="anchor" href="https://ko-fi.com/link0069">Kofi</a>
			</div>
		</div>
	{:else}
		<h1 class="h1 font-bold text-pre">Loading...</h1>
	{/if}
</div>
