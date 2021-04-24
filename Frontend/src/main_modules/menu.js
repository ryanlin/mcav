const { Menu } = require('electron');
const MenuFunctions = require('./menu_functions.js');

function buildTemplate(window) {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Save Graph',
          click: async () => MenuFunctions.saveGraph()
        },
        {
          label: 'Load Graph',
          click: async () => MenuFunctions.loadGraph(window)
        },
        { role: 'quit' }
      ]
    },
  
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
  
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
  
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
  
    {
      role: 'help',
      submenu: [
        { label: 'Learn More' }
      ]
    }
  ]

  return template;
} 

function setMenu(window) {
  // template uses window for some functions
  const template = buildTemplate(window);
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

module.exports = {
  setMenu
}

