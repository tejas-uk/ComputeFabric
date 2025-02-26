/**
 * @description
 * The main process for the Electron-based ComputeFabric client. This file starts
 * an Electron app, creates a BrowserWindow, and loads the renderer UI from
 * App.tsx (bundled HTML).
 *
 * Key features:
 * - Basic Electron window creation
 * - "ready" event handling
 * - Placeholder for advanced config (menus, dev tools, etc.)
 *
 * @dependencies
 * - electron
 * - (Optional) cross-env or any build tool for packaging
 *
 * @notes
 * - This is a minimal skeleton. A real app would involve a bundler (Webpack/Vite),
 *   a dev script, and a production pack script (using electron-builder, for instance).
 * - For dev, you can run: `npm run electron-dev` (if configured) and open the window.
 */

import { app, BrowserWindow } from 'electron'
import * as path from 'path'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// Not used in a minimal skeleton, but can be included if needed
// if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
//   app.quit()
// }

// Create a new BrowserWindow
function createMainWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'ComputeFabric Client (Electron)'
  })

  // In dev, you might load localhost (from a dev server).
  // For MVP, let's load a local HTML file that references the React build output.
  const indexFile = path.join(__dirname, 'renderer', 'index.html')
  mainWindow.loadFile(indexFile)

  // Optional: Open dev tools automatically
  // mainWindow.webContents.openDevTools()
}

// Called when Electron has finished initialization
app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    // On macOS, re-create a window if the dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, typical behavior is to keep app open until user quits with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
