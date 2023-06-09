const { app } = require('electron');
const { creactMainWin, showMainWindow, closeMainWindow } = require('./win/mainWin');
const isDev = require('electron-is-dev');
const handleIPC = require('./ipc');
const getDesktopCapturerSources = require('./control/controlGetSources');
const setRobotJS = require('./control/robotControl');
const { crashReporterInit } = require('./crash-reporter');

// 屏蔽控制台安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
// windows客户端更新
if(require('electron-squirrel-startup')) return;
// 程序禁止多开，如果多开应用，则会把旧程序关闭，把新程序打开
const gotTheLock = app.requestSingleInstanceLock();
if(!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showMainWindow();
  });
  // 监听软件启动完成，加载软件更新
  app.on('will-finish-launching', () => {
    // electron程序崩溃日志上传
    crashReporterInit();
    if(!isDev) {
      // electron软件更新
      require('./update.js');
    }
  });
  // 应用准备完成
  app.on('ready', () => {
    // 傀儡窗口
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
    // 显示傀儡端主窗口
    showMainWindow();
    // 测试electron程序崩溃
    // process.crash();
  });
}
