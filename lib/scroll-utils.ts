export const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (!element) return

  const headerOffset = 80 // Height of sticky header (64px) + some padding
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  })
} 