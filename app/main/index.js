const { app } = require('electron');
const { creactMainWin, showMainWindow, closeMainWindow } = require('./win/mainWin');
const handleIPC = require('./ipc');
const getDesktopCapturerSources = require('./control/controlGetSources');
const setRobotJS = require('./control/robotControl');

// 屏蔽控制台安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// 程序禁止多开，如果多开应用，则会把旧程序关闭，把新程序打开
const gotTheLock = app.requestSingleInstanceLock();
if(!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showMainWindow();
  });
  // 应用准备完成
  app.on('ready', () => {
    // 窗口
    creactMainWin();
    // 托盘和托盘右键菜单
    require('./trayAndMenu/index'); 
    // 跟服务端渲染进程通信
    handleIPC();
    // 获取桌面流暴露出去给渲染进程
    getDesktopCapturerSources();
    // 把robotjs暴露给渲染进程使用
    setRobotJS();
  });

  // 应用关闭前监听--关闭主窗口
  app.on('before-quit', () => {
    closeMainWindow();
  });

  // 监听应用激活，窗口假关闭，应用不会真正退出
  app.on('activate', () => {
    showMainWindow();
  });
}
