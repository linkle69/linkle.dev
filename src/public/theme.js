const themeQuery = window.matchMedia('(prefers-color-scheme: dark)')

function setTheme(isDark) {
    const root = document.documentElement

    if (isDark) {
        root.setAttribute('data-theme', 'dark')
    } else {
        root.removeAttribute('data-theme')
    }
}

themeQuery.addEventListener('change', (e) => {
    setTheme(e.matches)
    localStorage.setItem('theme', e.matches ? 'dark' : 'light')
})
