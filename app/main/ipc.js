const { ipcMain } = require('electron');
const { sendMainWindow } = require('./win/mainWin');
const { createControlWin, sendControlWindow } =  require('./win/controlWin');
const signal = require('./signal');

module.exports = function() {
  ipcMain.handle('login', async() => {
    // const code = Math.floor(Math.random() * (999999 - 100000)) + 100000
    const { code } = await signal.invoke('login', null, 'logined');
    return code;
  });

  // 控制
  // ipcMain.on('control', (e, remoteCode) => {
  //   // 跟服务端交互
  //   sendMainWindow('control-state-change', remoteCode, 1);
  //   // 创建控制窗口
  //   createControlWin();
  // });
  
  // 响应事件
  ipcMain.on('control', (e, remote) => {
    // *** 服务端的通信 ***
    signal.send('control', { remote });
  });
  // 监听被控制事件
  signal.on('controlled', (data) => {
    console.log('controlled: ', data);
    sendMainWindow('control-state-change', data.remote, 1);
    // 创建控制窗口
    createControlWin();
  });
  signal.on('be-controlled', (data) => {
    console.log('be-controlled:', data);
    sendMainWindow('control-state-change', data.remote, 2);
  });

  // 服务端信令响应
  ipcMain.on('forward', (e, event, data) => {
    signal.send('forward', { event, data });
  });
  // 响应监听转发消息
  signal.on('offer', data => {
    sendMainWindow('offer', data);
  });
  signal.on('answer', data => {
    sendControlWindow('answer', data);
  });
  signal.on('puppet-candidate', data => {
    sendControlWindow('candidate', data);
  });
  signal.on('control-candidate', data => {
    sendMainWindow('candidate', data);
  });
}