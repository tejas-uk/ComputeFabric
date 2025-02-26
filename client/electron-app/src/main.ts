/**
 * @description
 * Main process for the ComputeFabric Electron application.
 * This file creates and manages the application window and IPC communication.
 *
 * Key features:
 * - Create main application window
 * - Handle IPC events for job submission and status
 * - Set up communication with the Orchestrator service
 *
 * @dependencies
 * - electron: For cross-platform desktop app capabilities
 * - dotenv: For loading environment variables
 * - axios: For HTTP requests to the Orchestrator API
 *
 * @notes
 * - For MVP, focus is on basic functionality over extensive features
 * - Development tools are loaded only in development mode
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

// Base URL for the orchestrator API
const ORCHESTRATOR_BASE_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:4000';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'ComputeFabric GPU Job Manager'
  });

  // Load the renderer from a local HTML file
  // In production, this would be served from a bundled resource
  const indexHtmlPath = path.join(__dirname, 'renderer', 'index.html')
  const startUrl = url.pathToFileURL(indexHtmlPath).toString()
  // const startUrl = process.env.ELECTRON_START_URL || url.format({
  //   pathname: path.join(__dirname, 'index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // });
  
  mainWindow.loadURL(startUrl);

  // Open the DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Remove reference when window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Initialize the app when Electron is ready
 */
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create a window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * Quit when all windows are closed, except on macOS
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ======= IPC Event Handlers =======

/**
 * Submit a job to the orchestrator
 */
ipcMain.handle('submit-job', async (event, jobData) => {
  try {
    const response = await axios.post(`${ORCHESTRATOR_BASE_URL}/jobs`, jobData);
    return response.data;
  } catch (error: any) {
    console.error('Failed to submit job:', error);
    throw new Error(`Failed to submit job: ${error.message}`);
  }
});

/**
 * Get a job's status by ID
 */
ipcMain.handle('get-job-status', async (event, jobId) => {
  try {
    const response = await axios.get(`${ORCHESTRATOR_BASE_URL}/jobs/${jobId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to get status for job ${jobId}:`, error);
    throw new Error(`Failed to get job status: ${error.message}`);
  }
});

/**
 * List all jobs for a user
 */
ipcMain.handle('list-jobs', async (event, { userId, limit, status }) => {
  try {
    const params = { userId, limit, status };
    const response = await axios.get(`${ORCHESTRATOR_BASE_URL}/jobs`, { params });
    return response.data;
  } catch (error: any) {
    console.error('Failed to list jobs:', error);
    throw new Error(`Failed to list jobs: ${error.message}`);
  }
});

/**
 * Check if the orchestrator is online
 */
ipcMain.handle('check-health', async () => {
  try {
    const response = await axios.get(`${ORCHESTRATOR_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw new Error('Orchestrator is not reachable');
  }
});