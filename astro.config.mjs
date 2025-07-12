// @ts-check
import { defineConfig } from 'astro/config'
import icon from 'astro-icon'

export default defineConfig({
    integrations: [icon()],
    site: 'https://linkle.dev',
    image: { domains: ['autumn.revolt.chat', 'lumap.xyz', 'instellate.xyz'] }
})
