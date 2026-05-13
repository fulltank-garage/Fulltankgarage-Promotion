const defaultBaseUrl = 'http://localhost:8080/api'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const apiBaseUrl = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/+$/, '')
  : import.meta.env.DEV
    ? defaultBaseUrl
    : '/api'

export const isApiBaseUrlConfigured = Boolean(
  configuredBaseUrl || import.meta.env.DEV,
)

export const getJson = async <ResponseBody>(
  path: string,
  init?: RequestInit,
) => {
  if (!isApiBaseUrlConfigured) {
    throw new Error('ไม่พบการตั้งค่า API สำหรับระบบโปรโมชัน')
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json() as Promise<ResponseBody>
}
