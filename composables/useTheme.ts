import { ref } from 'vue'

export const useTheme = () => {
  const isDark = ref(false)

  const initTheme = () => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
    applyTheme()
  }

  const applyTheme = () => {
    const theme = isDark.value ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  return {
    isDark,
    toggleTheme,
    initTheme
  }
} 