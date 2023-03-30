const { app } = require('electron');
const { creactMainWin } = require('./mainWin');
const { createControlWin } =  require('./controlWin');
const handleIPC = require('./ipc');
const getDesktopCapturerSources = require('./controlGetSources');
const setRobotJS = require('./robotControl');

// 屏蔽控制台安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.whenReady().then(() => {
  creactMainWin();
  // createControlWin();
  // 跟服务端渲染进程通信
  handleIPC();
  // 获取桌面流暴露出去给渲染进程
  getDesktopCapturerSources();
  // 把robotjs暴露给渲染进程使用
  setRobotJS();
});