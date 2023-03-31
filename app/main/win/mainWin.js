const { BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const { resolve } = require('path');

let mainWin;
let willQuitApp = false
function creactMainWin () {
  mainWin = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // 主窗口的关闭事件监听：判断应用是否退出
  mainWin.on('close', (e) => {
    if(willQuitApp) {
      mainWin = null;
    } else {
      e.preventDefault();
      mainWin.hide(); // 没有退出，则隐藏窗口
    }
  });
  
  if(isDev) {
    mainWin.loadURL('http://localhost:3000/');
    // 打开控制台
    // mainWin.openDevTools();
  } else {
    mainWin.loadFile(resolve(__dirname, '../../renderer/pages/main/index.html'));
  }
}

function sendMainWindow(channel, ...args) {
  mainWin.webContents.send(channel, ...args);
}

function showMainWindow() {
  mainWin.show();
}

function closeMainWindow() {
  willQuitApp = true; // 将关闭应用
  mainWin.close(); // 关闭窗口
}

module.exports = { creactMainWin, sendMainWindow, showMainWindow, closeMainWindow };