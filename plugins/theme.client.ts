export default defineNuxtPlugin(() => {
  // Set initial theme on client side
  const initTheme = () => {
    const theme = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', theme)
  }

  // Run on plugin load
  initTheme()

  return {
    provide: {
      initTheme
    }
  }
}) 