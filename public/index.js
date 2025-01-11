const owner = '476662199872651264'
const friends = ['565197576026980365', '585278686291427338']
const api = 'https://discordlookup.mesalytic.moe/v1'

function componentToHex(c) {
    const hex = c.toString(16)
    return hex.length == 1 ? '0' + hex : hex
}

function adjustColor(hexColor, darken = true, amount = 50) {
    const threshold = darken ? 180 : 75
    let r = parseInt(hexColor.substring(1, 3), 16)
    let g = parseInt(hexColor.substring(3, 5), 16)
    let b = parseInt(hexColor.substring(5, 7), 16)
    let brightness = (r * 299 + g * 587 + b * 114) / 1000

    if ((darken && brightness > threshold) || (!darken && brightness < threshold)) {
        r = darken ? Math.max(0, r - amount) : Math.min(255, r + amount)
        g = darken ? Math.max(0, g - amount) : Math.min(255, g + amount)
        b = darken ? Math.max(0, b - amount) : Math.min(255, b + amount)
    }

    const rc = componentToHex(r)
    const gc = componentToHex(g)
    const bc = componentToHex(b)
    return `#${rc}${gc}${bc}`
}

function hexToRGBA(hex, transparency = 1) {
    const r = parseInt(hex.substring(1, 3), 16)
    const g = parseInt(hex.substring(3, 5), 16)
    const b = parseInt(hex.substring(5, 7), 16)
    const a = transparency
    return `rgba(${r}, ${g}, ${b}, ${a})`
}

const ownerResponse = await fetch(`${api}/user/${owner}`)
const ownerData = await ownerResponse.json()
const friendResponses = await Promise.all(
    friends.map((friend) => fetch(`${api}/user/${friend}`))
)

const friendData = await Promise.all(friendResponses.map((response) => response.json()))
const root = document.documentElement
const color = ownerData.accent_color.toString(16).padStart(6, '0')
const hexColor = `#${color}`
const colorLighter = adjustColor(hexColor, false, 60)
const colorDarker = adjustColor(hexColor, true)

root.style.setProperty('--accent-color', colorLighter)
root.style.setProperty('--selection-color', hexToRGBA(colorDarker, 0.5))

const ownerElement = document.getElementById('owner')
const animated = ownerData.avatar.is_animated
const extension = animated ? 'gif' : 'webp'

ownerElement.src = `${ownerData.avatar.link}.${extension}?size=256`
ownerElement.alt = ownerData.global_name

friendData.forEach((friend, index) => {
    const friendElement = document.getElementById(`friend${index + 1}`)
    const animated = friend.avatar.is_animated
    const extension = animated ? 'gif' : 'webp'
    
    friendElement.src = `${friend.avatar.link}.${extension}?size=128`
    friendElement.alt = friend.global_name
})
