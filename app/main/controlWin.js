const { BrowserWindow } = require('electron');
const path = require('path');

let controlWin;
function createControlWin () {
  controlWin = new BrowserWindow({
    width: 1000,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  
  controlWin.loadFile(path.resolve(__dirname, '../renderer/pages/control/index.html'));
}

module.exports = { createControlWin };