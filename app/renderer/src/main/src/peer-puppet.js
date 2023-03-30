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

// onicecandidate
pc.onicecandidate = function(e) {
  console.log('onicecandidate',JSON.stringify(e.candidate));
}
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
// 挂载到全局
window.addIceCandidate = addIceCandidate;

async function createAnswer(offer) {
  let screenStream = await getScreenStream();

  pc.addStream(screenStream);
  console.log('offer',offer);
  await pc.setRemoteDescription(offer);
  await pc.setLocalDescription(await pc.createAnswer());

  console.log('answer', JSON.stringify(pc.localDescription));

  return pc.localDescription;
}
// 挂载到全局
window.createAnswer = createAnswer;