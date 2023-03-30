const { ipcRenderer } = require('electron');

// createAnswer
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
      reject(err);
      console.error(err);
    });
  });
}

// 渲染进程RTC
const pc = new window.RTCPeerConnection({});
async function createAnswer() {
  let screenStream = await getScreenStream();
  await pc.addStream(screenStream);
  await pc.setLocalDescription(await pc.createAnswer());

  console.log('answer', JSON.stringify(pc.localDescription));

  return pc.localDescription;
}
// 挂载到全局
window.createAnswer = createAnswer;