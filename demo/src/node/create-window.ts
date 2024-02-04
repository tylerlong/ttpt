import { BrowserWindow, app, shell } from 'electron';
import { join } from 'path';

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 928,
    webPreferences: {
      preload: join(__dirname, '..', '..', 'build', 'preload.js'),
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(join('build', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:1234');
  }

  // open new window in external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

export default createWindow;
