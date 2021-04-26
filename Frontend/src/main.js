const { app, BrowserWindow } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let window = null;

const createWindow = () => {
  // Create the browser window.
  window = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "../build/car_logo.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  // and load the index.html of the app.
  window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Warn when closing
  window.on('close', function(e){
    var choice = require('electron').dialog.showMessageBoxSync(this,
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit?'
      }
    );
    
    if(choice == 1){
      e.preventDefault();
    }
  });

  // Set Menu Options
  const { setMenu } = require("./main_modules/menu.js");
  setMenu(window);

  // Initializing Message Passing Event Listeners //
  const { initializeMessagePassingListeners } = require("./main_modules/ipcMain_functions.js");
  initializeMessagePassingListeners(window);

  // Open the DevTools.
  //window.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On OS X it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
