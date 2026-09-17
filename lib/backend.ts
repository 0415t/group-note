import type { BackendAction, BackendActionResponse, BackendState } from './api-types'

const API_STATE_URL = '/api/state'
const API_ACTION_URL = '/api/action'

async function fetchBackendState(): Promise<BackendState> {
  const response = await fetch(API_STATE_URL)
  if (!response.ok) {
    throw new Error('Failed to fetch backend state')
  }
  return response.json()
}

async function sendBackendAction(action: BackendAction): Promise<BackendActionResponse> {
  const response = await fetch(API_ACTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  })
  if (!response.ok) {
    throw new Error('Failed to send backend action')
  }
  return response.json()
}

export { fetchBackendState, sendBackendAction }
