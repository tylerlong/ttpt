import { BrowserWindow, app } from 'electron';
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
};

export default createWindow;
