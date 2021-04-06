const electron = require('electron');
const ipcMain = require('electron').ipcMain;
const path = require('path');

console.log("OWOOOOOOOOOOO")

ipcMain.on('main-process-info', (event, arg) => {
    switch(arg) {
        case "original-node-modules-path":
            event.returnValue = path.resolve(electron.app.getAppPath(), 'node_modules');
        case "original-preload-script":
            event.returnValue = event.sender.__preload;
    }
});

ipcMain.on('main-process-utils', (event, arg) => {
    switch(arg) {
        case "dialog":
            event.returnValue = `${electron.dialog}`;
    }
});

ipcMain.handle('bd-navigate-page-listener', (event, arg) => {
    event.sender.getOwnerBrowserWindow().webContents.on('did-navigate-in-page', arg);
})

ipcMain.handle('remove-bd-navigate-page-listener', (event, arg) => {
    event.sender.getOwnerBrowserWindow().webContents.removeEventListener('did-navigate-in-page', arg);
})


electron.app.commandLine.appendSwitch("no-force-async-hooks-checks");

electron.session.defaultSession.webRequest.onHeadersReceived(function(details, callback) {
    if (!details.responseHeaders['content-security-policy-report-only'] && !details.responseHeaders['content-security-policy']) return callback({cancel: false});
    delete details.responseHeaders['content-security-policy-report-only'];
    delete details.responseHeaders['content-security-policy'];
    callback({cancel: false, responseHeaders: details.responseHeaders});
});

class BrowserWindow extends electron.BrowserWindow {
    constructor(originalOptions) {
        let win = new electron.BrowserWindow(originalOptions);
        if (!originalOptions || !originalOptions.webPreferences || !originalOptions.title) return win; // eslint-disable-line constructor-super
        const originalPreloadScript = originalOptions.webPreferences.preload;
        console.log("EWEE")

        originalOptions.webPreferences.preload = path.join(process.env.injDir, 'dom.js');
        originalOptions.webPreferences.transparency = true;

        win = new electron.BrowserWindow(originalOptions);
        win.webContents.__preload = originalPreloadScript;
        return win;
    }
}

BrowserWindow.webContents;

const electron_path = require.resolve('electron');
Object.assign(BrowserWindow, electron.BrowserWindow); // Assigns the new chrome-specific ones

if (electron.deprecate && electron.deprecate.promisify) {
	const originalDeprecate = electron.deprecate.promisify; // Grab original deprecate promisify
	electron.deprecate.promisify = (originalFunction) => originalFunction ? originalDeprecate(originalFunction) : () => void 0; // Override with falsey check
}

const newElectron = Object.assign({}, electron, {BrowserWindow});
// Tempfix for Injection breakage due to new version of Electron on Canary (Electron 7.x)
// Found by Zerebos (Zack Rauen)
delete require.cache[electron_path].exports;
// /TempFix
require.cache[electron_path].exports = newElectron;
//const browser_window_path = require.resolve(path.resolve(electron_path, '..', '..', 'browser-window.js'));
//require.cache[browser_window_path].exports = BrowserWindow;
