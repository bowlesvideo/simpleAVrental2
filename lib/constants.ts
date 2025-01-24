export const SITE_NAME = 'Go Video Pro'
export const featureIcons = {
  video: 'Video',
  microphone: 'Mic',
  stream: 'Cast',
  clock: 'Clock',
  camera: 'Camera',
  audio: 'Volume2',
  lighting: 'Sun',
  users: 'Users'
} as const

export const COMPANY_NAME = 'Go Video Pro'
export const COMPANY_EMAIL = 'info@govideopro.com'
export const COMPANY_PHONE = '(555) 123-4567'
export const COMPANY_ADDRESS = '123 Main St, Suite 100, San Francisco, CA 94105'

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  
  return 'http://localhost:3000'
} 