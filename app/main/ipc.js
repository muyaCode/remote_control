const { ipcMain } = require('electron');
const { sendMainWindow } = require('./mainWin');
const { createControlWin } =  require('./controlWin');

module.exports = function() {
  ipcMain.handle('login', async () => {
    // 返回一个code
    let code = Math.floor(Math.random() * (999999 - 100000)) + 100000;

    return code;
  });
  ipcMain.on('control', async(e, remoteCode) => {
    // 跟服务端交互
    sendMainWindow('control-state-change', remoteCode, 1);
    // 创建控制窗口
    createControlWin();
  });
}