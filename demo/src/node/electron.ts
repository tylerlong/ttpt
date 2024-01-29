import { app, BrowserWindow } from 'electron';

import createWindow from './create-window';
import { updateApplicationMenu } from './application-menu';
import { enableContextMenu } from './context-menu';

app.whenReady().then(() => {
  updateApplicationMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// for both the main window and the settings window
app.on('browser-window-created', (event, browserWindow) => {
  enableContextMenu(browserWindow);
  if (!app.isPackaged) {
    // for development debugging purpose only
    browserWindow.webContents.openDevTools();
  }
});
