import type { BrowserWindow } from 'electron';
import { Menu } from 'electron';

export const enableContextMenu = (browserWindow: BrowserWindow) => {
  const selectionMenu = Menu.buildFromTemplate([{ role: 'copy' }, { type: 'separator' }, { role: 'selectAll' }]);
  const inputMenu = Menu.buildFromTemplate([
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { type: 'separator' },
    { role: 'selectAll' },
  ]);
  browserWindow.webContents.on('context-menu', (e, props) => {
    const { selectionText, isEditable } = props;
    if (isEditable) {
      inputMenu.popup({ window: browserWindow });
    } else if (selectionText && selectionText.trim() !== '') {
      selectionMenu.popup({ window: browserWindow });
    }
  });
};
