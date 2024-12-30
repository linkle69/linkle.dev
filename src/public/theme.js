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
    document.cookie = `theme=${e.matches ? 'dark' : 'light'}; path=/`
})

const cookieExists = document.cookie !== ''

if (!cookieExists) {
    setTheme(themeQuery.matches)
    document.cookie = `theme=${themeQuery.matches ? 'dark' : 'light'}; path=/`
} else {
    const theme = document.cookie.split('; ').find((row) => row.startsWith('theme='))
    setTheme(theme === 'dark')
}
