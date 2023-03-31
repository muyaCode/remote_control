const EventEmitter = require('events');
const peer = new EventEmitter();
const { ipcRenderer } = window.require('electron');

// robot控制监听
// peer.on('robot', (type, data) => {
//   if(type === 'mouse') {
//     data.screen = {
//       width: window.screen.width,
//       height: window.screen.height
//     }
//   }
//   ipcRenderer.send('robot',type , data);
// });

// 控制端RTC创建
const pc = new window.RTCPeerConnection({});

// onicecandidate
pc.onicecandidate = function(e) {
  // console.log('控制端candidate：', JSON.stringify(e.candidate));
  if(e.candidate) {
    ipcRenderer.send('forward', 'control-candidate', JSON.stringify(e.candidate));
  }
}
ipcRenderer.on('candidate', (e, candidate) => {
  addIceCandidate(JSON.parse(candidate));
});

// iceEventaddIceCandidate
let candidates = [];
async function addIceCandidate(candidate) {
  if(candidate) {
    candidates.push(candidate);
  }
  if(pc.remoteDescription && pc.remoteDescription.type) {
    for(let i = 0; i < candidates.length; i++) {
      await pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
    }
    candidates = [];
  }
}

// 创建控制供给offer
async function createOffer() {
  const offer = await pc.createOffer({
    offerToReceiveAudio: false,
    offerToReceiveVideo: true
  });
  await pc.setLocalDescription(offer);
  // console.log('控制端RTC offer：', JSON.stringify(offer));
  return pc.localDescription;
}
createOffer().then((offer) => {
  ipcRenderer.send('forward', 'offer', { type: offer.type, sdp: offer.sdp });
});

// 设置转发到傀儡端
async function setRemote(answer) {
  await pc.setRemoteDescription(answer);
}

ipcRenderer.on('answer', (e, answer) => {
  setRemote(answer);
});

// 监听添加流的事件
pc.onaddstream = function(e) {
  console.log('add stream',e);
  peer.emit('add-stream', e.stream);
}

module.exports = peer;