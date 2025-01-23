export const SITE_NAME = 'Go Video Pro'
export const featureIcons = {
  camera: 'M12 6.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM12 9a3 3 0 100 6 3 3 0 000-6z',
  switcher: 'M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm1 2v10h14V7H5z',
  stream: 'M2 4.5A2.5 2.5 0 014.5 2h15A2.5 2.5 0 0122 4.5v15a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 19.5v-15zM4.5 4a.5.5 0 00-.5.5v15a.5.5 0 00.5.5h15a.5.5 0 00.5-.5v-15a.5.5 0 00-.5-.5h-15z',
  users: 'M12 11a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z',
  clock: 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm1-8h4v2h-6V7h2v5z',
  audio: 'M12 3v18M7.5 8v8M2.5 11v2M16.5 7v10M21.5 11v2',
  lighting: 'M12 2v6m0 14v-6m6-4h-6m-6 0H4m15.657-6.343l-4.243 4.243m-8.485 8.485l4.243-4.243m0-8.485L7.929 4.929m8.485 8.485l4.243 4.243',
  video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z',
  microphone: 'M12 1a5 5 0 015 5v6a5 5 0 01-10 0V6a5 5 0 015-5zM5 11a7 7 0 0014 0h2a9 9 0 01-7 8.777V23h-4v-3.223A9 9 0 013 11h2z'
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