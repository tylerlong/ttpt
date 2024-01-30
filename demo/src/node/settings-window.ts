import { BrowserWindow, ipcMain, screen, systemPreferences, app } from 'electron';
import path from 'path';

import CONSTS from '../constants';
import { toggleDarkMode } from './dark-mode';

let settingsWindow: BrowserWindow | undefined;

export const showSettingsWindow = () => {
  if (!settingsWindow) {
    settingsWindow = new BrowserWindow({
      width: 505,
      height: 714,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, '..', '..', 'build', 'preload.js'),
      },
    });
    settingsWindow.setAlwaysOnTop(true);
    if (app.isPackaged) {
      settingsWindow.loadFile('build/settings.html');
    } else {
      settingsWindow.loadURL('http://localhost:1235');
    }
    settingsWindow.on('closed', () => {
      settingsWindow = undefined;
    });
    settingsWindow.webContents.once('did-finish-load', () => {
      toggleDarkMode(settingsWindow);
    });
  }
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const { width: displayWidth, height: displayHeight } = display.bounds;
  const { width: windowWidth, height: windowHeight } = settingsWindow.getBounds();
  settingsWindow.setPosition(
    Math.round((displayWidth - windowWidth) / 2 + display.workArea.x),
    Math.round((displayHeight - windowHeight) / 2 + display.workArea.y),
  );
  settingsWindow.focus();
};

class Settings {
  public appearance = 'auto';
}
ipcMain.handle(CONSTS.LOAD_SETTINGS, async () => {
  const settings = new Settings();
  settings.appearance = systemPreferences.getUserDefault('appearance', 'string');
  if (settings.appearance === '') {
    settings.appearance = 'auto';
  }
  return settings;
});
ipcMain.handle(CONSTS.SAVE_SETTINGS, async (event, settings: Settings) => {
  systemPreferences.setUserDefault('appearance', 'string', settings.appearance);
  toggleDarkMode();
});
