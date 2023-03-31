const { ipcMain } = require('electron');
const robot = require('robotjs');
const vkey = require('vkey');

function handleKey(data) {
  console.log('handle Key',data);
  // data: { keyCode, meta, alt, ctrl, shift }
  const modifiers = [];
  const { meta, alt, ctrl, shift, keyCode } = data;
  if(meta) modifiers.push('meta');
  if(alt) modifiers.push('alt');
  if(ctrl) modifiers.push('ctrl');
  if(shift) modifiers.push('shift');
  let key = vkey[keyCode].toLowerCase();
  if(key[0] !== '<') { // <shift> 按键过滤
    robot.keyTap(key, modifiers); // 按键输入
  }
}

function handleMouse(data) {
  console.log('handle Mouse',data);
  // data:{ clientX, clientY, screen:{ width, height }, video:{ width, height } }
  const { clientX, clientY, screen, video } = data;
  let x = clientX * screen.width / video.width;
  let y = clientY * screen.height / video.height;
  robot.moveMouse(x, y);
  robot.mouseClick();
}

function setRobotJS() {
  ipcMain.on('robot', (event, type, data) => {
    if(type === 'mouse') {
      handleMouse(data);
    } else if(type === 'key') {
      handleKey(data);
    }
  });

  // 直接传递方法
  // ipcMain.handle('robot', (event, ...args) => {
  //   return robot[args[0]](...args.slice(1));
  // });
  // 渲染进程这样传值
  // ipcRenderer.invoke('robotjs', 'moveMouse', 100, 100);
}

module.exports = setRobotJS;