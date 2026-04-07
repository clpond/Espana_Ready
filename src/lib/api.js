export async function apiFetch(url, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
  return data
}

export function getToken() {
  return localStorage.getItem('token')
}

export async function authFetch(url, opts = {}) {
  return apiFetch(url, { ...opts, token: getToken() })
}
