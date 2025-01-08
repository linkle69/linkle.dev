const owner = '476662199872651264'
const friends = ['565197576026980365', '585278686291427338']

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

async function loadUsers() {
    const ownerRequest = [
        fetch(`/user/${owner}`).then((res) =>
            res.json().then((data) => {
                const element = document.getElementById('owner')
                element.alt = data.global_name
            })
        )
    ]

    const friendRequests = friends.map((friendId, i) =>
        fetch(`/user/${friendId}`)
            .then((res) => res.json())
            .then((friendData) => {
                const element = document.getElementById(`friend${i + 1}`)
                element.alt = friendData.global_name
            })
    )

    await Promise.all(ownerRequest.concat(friendRequests))
}

async function loadColor() {
    try {
        const root = document.documentElement
        const response = await fetch(`/color/${owner}`)

        if (!response.ok) {
            throw new Error('Color not found')
        }

        const color = await response.text()
        const colorLighter = adjustColor(color, false, 70)
        const colorDarker = adjustColor(color, true)
        root.style.setProperty('--accent-color', colorLighter)
        root.style.setProperty('--selection-color', hexToRGBA(colorDarker, 0.5))
    } catch (error) {
        console.error(error)
    }
}

async function bannerCheck() {
    const banner = document.getElementById('banner')
    const response = await fetch(`/banner/${owner}`)

    if (response.ok) banner.style.display = 'block'
}

Promise.all([loadColor(), loadUsers(), bannerCheck()])