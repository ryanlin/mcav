const { dialog, ipcRenderer, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { type } = require('os');

// setup receiver from renderer for getGraph
ipcMain.on("saveGraph", (e, graph) => {
  console.log("saveGraph: ", graph);
  writeToFile(graph, "untitled", ".json");
});

function saveGraph(window) {
  // TODO look into better way to implement savegraph
  // request for saveGraph response from renderer
  console.log("mainsg");
  window.webContents.send("saveGraph");
}

function loadGraph(window) {
  // Open dialog to choose file
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [ {name: 'Graphs', extensions: ['json']} ]
  })
  .then(function(fileObj) {
    // the fileObj has two props
    if (!fileObj.canceled) {
      const filePath = path.resolve(__dirname, fileObj.filePaths[0]);
      const rawData = fs.readFileSync(filePath);
      const jsonData = JSON.parse(rawData);

      // send jsonData for preload.js to take to renderer
      window.webContents.send('loadGraph', jsonData);
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
      let blob;
      console.log("data: ", data);
      if (typeof(data) !== "string") {
        console.log("typeof: ", typeof(data));
        //saveData = JSON.stringify(data);
        saveData = JSON.stringify(data, null, 2);
        // blob = new Blob([fileData], {type: "text/plain"});
      }
      console.log("saveData: ", data);

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
