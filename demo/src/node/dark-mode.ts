import { BrowserWindow, ipcMain, nativeTheme, systemPreferences } from 'electron';

import CONSTS from '../constants';

export const toggleDarkMode = (browserWindow?: BrowserWindow) => {
  let appearance = systemPreferences.getUserDefault('appearance', 'string');
  if (!['auto', 'light', 'dark'].find((item) => item === appearance)) {
    appearance = 'auto';
  }
  let isDarkMode = false;
  if (appearance === 'auto') {
    isDarkMode = nativeTheme.shouldUseDarkColors;
  } else {
    isDarkMode = appearance === 'dark';
  }
  const windows = browserWindow ? [browserWindow] : BrowserWindow.getAllWindows();
  for (const browserWindow of windows) {
    browserWindow.webContents.send(CONSTS.IS_DARK_MODE, isDarkMode);
  }
};

// a newly created window may request the current dark mode status
ipcMain.handle(CONSTS.IS_DARK_MODE, (event) => {
  toggleDarkMode(BrowserWindow.fromWebContents(event.sender)!);
});

nativeTheme.on('updated', () => toggleDarkMode());
