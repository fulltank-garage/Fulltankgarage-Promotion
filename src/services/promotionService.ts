import { getJson } from '../lib/api'

export type ApiHealthResponse = {
  status: string
  service: string
  startedAt: string
}

export const getApiHealth = () => getJson<ApiHealthResponse>('/health')
