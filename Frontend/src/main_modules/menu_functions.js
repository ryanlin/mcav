const { dialog, ipcRenderer, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { type } = require('os');

// setup receiver from renderer for getGraph
ipcMain.on("saveGraph", (e, graph) => {
  writeToFile(graph, "untitled", ".mcav");
});

function saveGraph(window) {
  // TODO look into better way to implement savegraph
  // request for saveGraph response from renderer
  window.webContents.send("saveGraph");
}

// Loads the user passed MCaV file and renders the components on the graph //
function loadGraph(window) {
  // Open dialog to choose file
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [ {name: 'mcav', extensions: ['mcav']} ]
  })
  .then(function(fileObj) {
    // the fileObj has two props
    if (!fileObj.canceled) {
      const filePath = path.resolve(__dirname, fileObj.filePaths[0]);

      const ext = filePath.split('.').pop(); // file extensiom

      console.log(ext);

      // Hotfix: check file type and if it has necesesary stuff before sending
      // TODO: seek if there is better solution
      if ( (ext === "mcav") ) {
        const rawData = fs.readFileSync(filePath);
        const jsonData = JSON.parse(rawData);

        // send jsonData for preload.js to take to renderer
        window.webContents.send('loadGraph', jsonData);
      } else {
        console.log("invalid");
        dialog.showErrorBox("Invalid File", "The file being imported is invalid.");
      }
    }
  })
  .catch(function(err) {
    console.error(err)
  })
}

function writeToFile(data, filename, extension) {
  // Set save dialog options
  const saveOptions = {
    title: "Save Calibration Graph JSON",
    defaultPath: path.join(__dirname, filename+extension),
    filters: [{
      name: filename,
      extensions: extension
    }]
  }

  // Show Save dialog, convert data to string
  dialog.showSaveDialog(saveOptions).then( file => {
    if (!file.canceled) {
      const savePath = file.filePath.toString();
      console.log(savePath);

      let saveData = "";
      if (typeof(data) !== "string") {
        saveData = JSON.stringify(data, null, 2);
      }

      fs.writeFile(savePath, saveData, (err) => {
        if (err) throw err;
        console.log("Saved!");
      });
    }
  });
}

module.exports = {
  saveGraph,
  loadGraph
}
