// 判断是Mac系统还是window系统
if(process.platform === 'darwin') {
  require('./darwin.js');
} else if(process.platform === 'win32') {
  require('./win32.js');
} else {
  // 其他系统
  console.log('order system');
}