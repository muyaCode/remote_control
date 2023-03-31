const { ipcRenderer } = window.require('electron');

// addstream
async function getScreenStream() {
  // 获取主进程中的desktopCapturer.getSources
  const sources = await ipcRenderer.invoke('DESKTOP_CAPTURER_GET_SOURCES');
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sources[0].id,
          maxWidth: window.screen.width,
          maxHeight: window.screen.height
        },
        // 加入以下两行代码
        mediaSource: 'screen',
        cursor: 'always' // 或者 "motion"
      }
    }).then((stream) => {
      resolve(stream);
    }).catch((err) => {
      console.error(err);
      reject(err);
    });
  });
}

// 傀儡端RTC创建
const pc = new window.RTCPeerConnection({});

// 傀儡端指令传输监听
pc.ondatachannel = (e) => {
  console.log('datachannel', e);
  // 监听robotjs参数的事件
  e.channel.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data);
    // 如果是鼠标行为
    if(type === 'mouse') {
      data.screen = {
        width: window.screen.width,
        height: window.screen.height
      }
    }
    // robot控制返回指令
    ipcRenderer.send('robot',type , data);
  }
}

// onicecandidate
pc.onicecandidate = function(e) {
  // console.log('傀儡端candidate：',JSON.stringify(e.candidate));
  if(e.candidate) {
    ipcRenderer.send('forward', 'puppet-candidate', JSON.stringify(e.candidate));
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

ipcRenderer.on('offer', async(e, offer) => {
  let answer = await createAnswer(offer);
  ipcRenderer.send('forward', 'answer', { type: answer.type, sdp: answer.sdp });
})

async function createAnswer(offer) {
  let screenStream = await getScreenStream();

  pc.addStream(screenStream);
  console.log('createAnswer1：',offer);
  await pc.setRemoteDescription(offer);
  await pc.setLocalDescription(await pc.createAnswer());

  // console.log('createAnswer2：', JSON.stringify(pc.localDescription));

  return pc.localDescription;
}
