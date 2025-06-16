// @ts-check
import { defineConfig } from 'astro/config'
import icon from 'astro-icon'

export default defineConfig({
    integrations: [icon()],
    site: 'https://linkdiscord.xyz',
    image: { domains: ['autumn.revolt.chat'] }
})
