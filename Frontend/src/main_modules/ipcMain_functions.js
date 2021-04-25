const { ipcMain } = require('electron');

// Message Passing Events //

function initializeMessagePassingListeners(window) {

  //Listen for the bagfile channel and return the bagfile data to renderer process//
  ipcMain.on("bagfile", (event, data) => {
    window.webContents.send("bagfile", data);
  })

  //Listen for the calibration channel and return the calibration data to renderer process//
  ipcMain.on("calibration", (event, data) => {
    window.webContents.send("calibration", data);
  })
}

module.exports = {
  initializeMessagePassingListeners
}
