const themeQuery = window.matchMedia('(prefers-color-scheme: dark)')

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

themeQuery.addEventListener('change', (e) => {
    setTheme(e.matches)
    localStorage.setItem('theme', !isDark ? 'dark' : 'light')
})

const theme = localStorage.getItem('theme')

if (theme) setTheme(theme === 'dark')
else setTheme(themeQuery.matches)

loadColor()
