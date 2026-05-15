import createClient, { type Middleware } from 'openapi-fetch'
import type { paths } from './schema'
import { useAuthStore } from '@/shared/store/auth.store'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const apiClient = createClient<paths>({ baseUrl: BASE_URL })

let isRefreshing = false
let queue: Array<(token: string) => void> = []

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = useAuthStore.getState().accessToken
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },

  async onResponse({ response, request }) {
    if (response.status !== 401) return response

    const store = useAuthStore.getState()

    if (isRefreshing) {
      return new Promise<Response>((resolve) => {
        queue.push((token) => {
          request.headers.set('Authorization', `Bearer ${token}`)
          resolve(fetch(request))
        })
      })
    }

    isRefreshing = true

    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${store.refreshToken}` },
      })

      if (!refreshRes.ok) {
        store.logout()
        return response
      }

      const tokens = await refreshRes.json() as { access_token: string; refresh_token: string }
      store.setTokens(tokens.access_token, tokens.refresh_token)

      queue.forEach((cb) => cb(tokens.access_token))
      queue = []

      request.headers.set('Authorization', `Bearer ${tokens.access_token}`)
      return fetch(request)
    } catch {
      store.logout()
      return response
    } finally {
      isRefreshing = false
    }
  },
}

apiClient.use(authMiddleware)
