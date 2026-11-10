const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
export function token(){ return localStorage.getItem('qubiq_token') }
export async function api(path, options={}) {
  const headers = { ...(options.body instanceof FormData ? {} : {'Content-Type':'application/json'}), ...(options.headers||{}) }
  if(token()) headers.Authorization = `Bearer ${token()}`
  const res = await fetch(`${BASE}${path}`, {...options, headers})
  if(!res.ok){ const msg = await res.text(); throw new Error(msg || `Request failed (${res.status})`) }
  if(res.status===204) return null
  return res.json()
}
