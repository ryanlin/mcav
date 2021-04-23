const { app, BrowserWindow, Menu, MenuItem, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
//const menu = require('./components/menu/menu');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let window = null;

// Configure Menu Bar Items
//menu.setMenu();

const createWindow = () => {
  // Create the browser window.
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  // and load the index.html of the app.
  window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  window.webContents.openDevTools();
};

const template = [
   {
     label: 'File',
     submenu: [
       {
         label: 'Save Graph',
         click() {
               console.log('item 1 clicked');
         }
       },
       {
         label: 'Load Graph',
         click() {
           dialog.showOpenDialog({
               properties: ['openFile']
             })
             .then(function(fileObj) {
                 // the fileObj has two props
                 if (!fileObj.canceled) {
                   console.log(fileObj.filePaths);
                   let rawdata = fs.readFileSync(path.resolve(__dirname, fileObj.filePaths[0]));
                   let jsonFile = JSON.parse(rawdata);
                   console.log(jsonFile);
                   window.webContents.send('load_graph', jsonFile);
                 }
              })
              // should always handle the error yourself, later Electron release might crash if you don't
              .catch(function(err) {
                 console.error(err)
              })
         }
       },
       {
         role: 'quit'
       }
     ]
   },

   {
      label: 'Edit',
      submenu: [
         {
            role: 'undo'
         },
         {
            role: 'redo'
         },
         {
            type: 'separator'
         },
         {
            role: 'cut'
         },
         {
            role: 'copy'
         },
         {
            role: 'paste'
         }
      ]
   },

   {
      label: 'View',
      submenu: [
         {
            role: 'reload'
         },
         {
            role: 'toggledevtools'
         },
         {
            type: 'separator'
         },
         {
            role: 'resetzoom'
         },
         {
            role: 'zoomin'
         },
         {
            role: 'zoomout'
         },
         {
            type: 'separator'
         },
         {
            role: 'togglefullscreen'
         }
      ]
   },

   {
      role: 'window',
      submenu: [
         {
            role: 'minimize'
         },
         {
            role: 'close'
         }
      ]
   },

   {
      role: 'help',
      submenu: [
         {
            label: 'Learn More'
         }
      ]
   }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

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

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("bagfile", (event, data) => {
  window.webContents.send("bagfile", data);
})

ipcMain.on("calibration", (event, data) => {
  window.webContents.send("calibration", data);
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
