const owner = '476662199872651264'
const friends = ['565197576026980365', '585278686291427338']

function setTheme(isDark) {
    const root = document.documentElement
    const sunIcon = document.querySelector('.sun-icon')
    const moonIcon = document.querySelector('.moon-icon')

    if (isDark) {
        root.setAttribute('data-theme', 'dark')
        sunIcon.style.display = 'block'
        moonIcon.style.display = 'none'
    } else {
        root.removeAttribute('data-theme')
        sunIcon.style.display = 'none'
        moonIcon.style.display = 'block'
    }
}

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
    const root = document.documentElement
    const themeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const theme = themeQuery.matches ? 'dark' : 'light'
    const color = await fetch(`/color/${owner}`).then((res) => res.text())

    if (theme === 'light') {
        const colorLighter = adjustColor(color, false, 30)
        const colorDarker = adjustColor(color, true)
        root.style.setProperty('--accent-color', colorDarker)
        root.style.setProperty('--selection-color', hexToRGBA(colorLighter, 0.3))
    } else {
        const colorLighter = adjustColor(color, false, 60)
        const colorDarker = adjustColor(color, true)
        root.style.setProperty('--accent-color', colorLighter)
        root.style.setProperty('--selection-color', hexToRGBA(colorDarker, 0.5))
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement
    const themeToggle = document.querySelector('.theme-toggle')
    const isDark = root.hasAttribute('data-theme')

    setTheme(isDark)
    loadUsers()
    loadColor()

    themeToggle.addEventListener('click', () => {
        const isDark = root.hasAttribute('data-theme')
        setTheme(!isDark)
        loadColor()
        localStorage.setItem('theme', !isDark ? 'dark' : 'light')
    })

    setTimeout(() => {
        document.body.style.transition = 'background-color 0.3s ease'
    }, 50)
})
