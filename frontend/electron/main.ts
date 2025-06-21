import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null; 

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  const startURL = process.env['NODE_ENV'] === 'development'
    ? 'http://localhost:4200'
    : `file://${path.join(__dirname, '../dist/frontend/index.html')}`;

  mainWindow.loadURL(startURL);
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null;
  })

}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

ipcMain.handle('localStorage:get', async (_event, key) => {
  // Renderer process will handle actual localStorage access
  // This is just a handler fallback (not used here)
  return null;
});

ipcMain.handle('localStorage:set', async (_event, key, value) => {
  return null;
});