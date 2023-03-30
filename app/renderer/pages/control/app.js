const peer = require('./peer-control');

peer.on('add-stream', (stream) => { play(stream); });

let video = document.getElementById('screen-video');
function play(stream) {
  video.srcObject = stream;
  video.onloadedmetadata = function() {
    video.play();
  }
}

// 鼠标点击监听
window.onkeydown = function(e) {
  // data: { keyCode, meta, alt, ctrl, shift }
  let data = {
    keyCode: e.keyCode,
    shift: e.shiftKey,
    meta: e.metaKey,
    control: e.ctrlKey,
    alt: e.altKey
  };
  peer.emit('robot', 'key', data);
}
// 键盘按键监听
window.onmouseup = function(e) {
  // data:{ clientX, clientY, screen:{ width, height }, video:{ width, height } }
  let data = {};
  data.clientX = e.clientX;
  data.clientY = e.clientY;
  data.video = {
    width: video.getBoundingClientRect().width,
    height: video.getBoundingClientRect().height
  }
  peer.emit('robot', 'mouse', data);
}