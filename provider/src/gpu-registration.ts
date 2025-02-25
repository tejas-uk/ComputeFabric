/**
 * @description
 * Functions to handle registration of the Provider with the Orchestrator.
 * For the MVP, we simply send a request to an endpoint (e.g. /providers/register)
 * with basic GPU info and get back an assigned provider ID if needed.
 *
 * Key features:
 * - "registerProvider" function that calls the Orchestrator
 * - Stubbed GPU specs
 *
 * @dependencies
 * - axios: For HTTP POST to Orchestrator
 *
 * @notes
 * - In production, the GPU specs might be detected from hardware queries (nvidia-smi, etc.)
 * - For MVP, we hard-code or mock these specs.
 */

import axios from 'axios'

interface GpuSpecs {
  name: string
  memory: string
  vendor: string
  // Add more fields if needed
}

/**
 * registerProvider
 * @param providerId - Existing provider ID if we already have one (optional)
 * @param orchestratorUrl - Base URL for the Orchestrator
 * @returns The resolved provider ID (could be newly assigned or existing)
 */
export async function registerProvider(
  providerId: string | null,
  orchestratorUrl: string
): Promise<string | null> {
  // Stubbed GPU specs
  const mockGpuSpecs: GpuSpecs = {
    name: 'NVIDIA GeForce GTX 1080 Ti',
    memory: '11GB',
    vendor: 'NVIDIA'
  }

  const payload = {
    providerId,
    gpuSpecs: mockGpuSpecs
  }

  try {
    console.log(`[Provider] Registering with Orchestrator at ${orchestratorUrl}...`)

    const response = await axios.post(`${orchestratorUrl}/providers/register`, payload)
    if (response.data && response.data.providerId) {
      console.log(`[Provider] Registration successful. Provider ID: ${response.data.providerId}`)
      return response.data.providerId
    } else {
      console.warn(`[Provider] Registration response did not include a providerId field.`)
      return providerId
    }
  } catch (error) {
    console.error('[Provider] Registration failed:', error)
    return providerId
  }
}

