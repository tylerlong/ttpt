import type { /* MenuItem, */ MenuItemConstructorOptions } from 'electron';
import { /* BrowserWindow, */ Menu, shell, app } from 'electron';
import { newTemplate } from 'electron-application-menu-template';

import createWindow from './create-window';
// import saveFile from './save-file';
// import openFile from './open-file';
// import revertFile from './revert-file';
import { showSettingsWindow } from './settings-window';

export const updateApplicationMenu = () => {
  // const hasWindow = !!BrowserWindow.getFocusedWindow();
  // const hasFile = !!BrowserWindow.getFocusedWindow()?.getRepresentedFilename();
  // const edited = !!BrowserWindow.getFocusedWindow()?.isDocumentEdited();

  const template = newTemplate();
  const appMenu = template.find((item) => item.role === 'appMenu')!;
  (appMenu.submenu as MenuItemConstructorOptions[]).splice(
    2,
    0,
    {
      label: 'Settings...',
      accelerator: 'CmdOrCtrl+,',
      async click() {
        showSettingsWindow();
      },
    },
    {
      type: 'separator',
    },
  );
  const viewMenu = template.find((item) => item.role === 'viewMenu')!;
  if (app.isPackaged) {
    viewMenu.submenu = (viewMenu.submenu as MenuItemConstructorOptions[]).filter(
      (item) => ['reload', 'forceReload', 'toggleDevTools'].indexOf(item.role ?? '') === -1,
    );
  }
  const helpMenu = template.find((item) => item.role === 'help')!;
  (helpMenu.submenu as MenuItemConstructorOptions[]).unshift({
    label: 'Customer Support',
    async click() {
      shell.openExternal('https://macmate.app/customer-support/');
    },
  });
  const fileMenu = template.find((item) => item.role === 'fileMenu')!;
  (fileMenu.submenu as MenuItemConstructorOptions[]).unshift(
    {
      label: 'New',
      accelerator: 'CmdOrCtrl+N',
      async click() {
        createWindow();
      },
    },
    //   {
    //     label: 'Open',
    //     accelerator: 'CmdOrCtrl+O',
    //     async click(menuItem: MenuItem, browserWindow: BrowserWindow | undefined) {
    //       openFile(browserWindow);
    //     },
    //   },
    //   {
    //     role: 'recentDocuments',
    //     submenu: [
    //       {
    //         role: 'clearRecentDocuments',
    //       },
    //     ],
    //   },
    //   {
    //     type: 'separator',
    //   },
    //   {
    //     label: 'Save',
    //     accelerator: 'CmdOrCtrl+S',
    //     enabled: hasWindow && (edited || !hasFile),
    //     async click(menuItem: MenuItem, browserWindow: BrowserWindow | undefined) {
    //       saveFile(browserWindow);
    //     },
    //   },
    //   {
    //     label: 'Save As...',
    //     accelerator: 'CmdOrCtrl+Shift+S',
    //     enabled: hasWindow,
    //     async click(menuItem: MenuItem, browserWindow: BrowserWindow | undefined) {
    //       saveFile(browserWindow, true);
    //     },
    //   },
    //   {
    //     label: 'Revert',
    //     enabled: edited,
    //     async click(menuItem: MenuItem, browserWindow: BrowserWindow | undefined) {
    //       revertFile(browserWindow);
    //     },
    //   },
    //   {
    //     type: 'separator',
    //   },
  );
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};
