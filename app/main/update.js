const { app, autoUpdater, dialog } = require('electron');

if(process.platform == 'darwin') {
  autoUpdater.setFeedURL('http://127.0.0.1:33855/darwin?version=' + app.getVersion());
} else if(process.platform == 'win32'){
  autoUpdater.setFeedURL('http://127.0.0.1:33855/win32?version=' + app.getVersion());
}

// 定时轮询，服务端推送
autoUpdater.checkForUpdates();

autoUpdater.on('update-available', (e, notes, version) => {
  // 配合main.js中的'will-finish-launching'的生命周期监听是在app.whenReady().then();之前
  // 提醒用户更新，dialog模块需要在app.whenReady().then();之后才能使用
  app.whenReady().then(() => {
    let clickId = dialog.showMessageBoxSync({
      type: 'info',
      title: '升级提示',
      message: '已为你升级到最新版，是否立即体验',
      buttons: ['马上升级', '手动重启'],
      cancelId: 1
    });
    if(cancelId === 0) {
      autoUpdater.quitAndInstall();
      app.quit();
    }
  });
});

autoUpdater.on('error', (err) => {
  console.log('update error：', err);
});
