const { dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function saveGraph(graph) {
  // TODO
  console.log("saveGraph");
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

module.exports = {
  saveGraph,
  loadGraph
}