/**
 * @description
 * Preload script for the ComputeFabric Electron app.
 * This exposes a safe API to the renderer process through contextBridge.
 *
 * Key features:
 * - Exposes IPC communication methods for job management
 * - Provides a secure channel between renderer and main processes
 *
 * @dependencies
 * - electron: For contextBridge and ipcRenderer
 *
 * @notes
 * - Always use contextBridge instead of directly exposing Node/Electron APIs
 * - Keep the API surface minimal and focused on necessary functionality
 */

import { contextBridge, ipcRenderer } from 'electron';

/**
 * API object exposed to the renderer process
 * All methods are proxies to IPC calls to the main process
 */
contextBridge.exposeInMainWorld('computeFabric', {
  /**
   * Submit a job to the orchestrator
   * @param jobData - Object containing job details (dockerImage, command, etc.)
   * @returns Promise resolving to the created job object
   */
  submitJob: (jobData: any) => ipcRenderer.invoke('submit-job', jobData),
  
  /**
   * Get status of a specific job
   * @param jobId - ID of the job to check
   * @returns Promise resolving to the job status object
   */
  getJobStatus: (jobId: string) => ipcRenderer.invoke('get-job-status', jobId),
  
  /**
   * List all jobs for a user
   * @param options - Object containing filter options (userId, limit, status)
   * @returns Promise resolving to an array of job objects
   */
  listJobs: (options: { userId?: string; limit?: number; status?: string }) => 
    ipcRenderer.invoke('list-jobs', options),
  
  /**
   * Check if the orchestrator service is healthy
   * @returns Promise resolving to the health status
   */
  checkHealth: () => ipcRenderer.invoke('check-health'),
  
  /**
   * Utility method to get application version
   * @returns Promise resolving to the app version string
   */
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});