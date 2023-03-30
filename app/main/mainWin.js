const { BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

let mainWin;
function creactMainWin () {
  mainWin = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  
  if(isDev) {
    mainWin.loadURL('http://localhost:3000/');
    // 打开控制台
    // mainWin.openDevTools();
  } else {
    mainWin.loadFile(path.resolve(__dirname, '../renderer/pages/main/index.html'));
  }
}

function sendMainWindow(channel, ...args) {
  mainWin.webContents.send(channel, ...args);
}

module.exports = { creactMainWin, sendMainWindow };