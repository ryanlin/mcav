const { contextBridge } = require("electron");


contextBridge.exposeInMainWorld(
  "api", {
    name: process.versions["node"]
  }
)