# 远程控制软件的实现

## 项目关键点分析

1.傀儡端告知控制端本机控制码

- 建立端与控制码的联系 -> 服务端需求

2.控制端输入控制码连接傀儡端

- 通过控制码找到用户->服务端需求
- 建立用户间连接->服务端需求or 客户端需求

3.傀偶端将捕获的画面传至控制端

- 捕获画面 、播放画面-> 客户端需求
- 用户间画面传输->服务端需求/客户端需求

4.控制端的鼠标和键盘指令传送至傀儡端

- 捕获指令 ->客户端需求
- 用户间指令传输->服务端需求/客户端需求

5.傀儡端响应控制指令

- 响应指令 -> 客户端需求

**服务端**：

- 建立端与控制码的联系
- 通过控制码找到用户

建立用户间连接

用户间画面传输

用户间指令传输

**客户端**：

- 捕获画面 、播放画面
- 捕获指令
- 响应指令

## 技术关键点

### 1.怎么捕获画面

使用Electron的 Main Process 模块 ：desktopCapturer -- <https://www.electronjs.org/zh/docs/latest/api/desktop-capturer>

### 2.怎么完成用户间连接、画面+指令传输

WebRTC：Web Real-Time Communications

- getUserMedia：获取多媒体数据(视频、音频)
- RTCPeerConnection：1.建立P2P连接；2.传输多媒体数据
- RTCDataChannel：传输数据

### 3.怎么响应控制指令

robot.js库：是一个Node的C++扩展库，可以帮我们实现鼠标移动，点击输入键盘等效果

### 4.音频视频流捕获

通过navigator.mediaDevices.getUserMedia

```js
navigator.mediaDevices.getUserMedia({
  audio: true,
  video: {
    width: { min: 1024, ideal: 1280, max: 1920 },
    height: { min: 576, ideal: 720, max: 1080 },
    frameRate: { max: 30 },
  },
}).then(stream => {
  console.log(stream);
  const video1 = document.getElementById("video1");
  video1.srcObject = stream;
  video1.onloadedmetadata = function () {
    video1.play();
  };
});
```

### 捕获桌面/窗口流

1.electron提取 chromeMediaSourceld

```js
desktopCapturer.getSources({ types: ['window', 'screen'] })
```

- Electron <5.0 是 callback 调用
- 5.0后是 promise，返回的是chromeMediaSources列表，包含 id，name，thumbnail，display_id

2.通过 navigator.mediaDevices.getUserMedia 播放桌面流

```js
navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sources[0].id,
        maxWidth: window.screen.width,
        maxHeight: window.screen.height
      },
      mediaSource: 'screen',
      cursor: 'always' // 或者 "motion"
    }
  }).then((stream) => {
      peer.emit('add-stream', stream);
  }).catch((err) => {
      console.error(err);
  });

// 该API被 从 web 标准中移除，换另一个
// navigator.webkitGetUserMedia({
//   audio: false,
//   video: {
//     mandatory：{
//       chromeMediaSource: 'desktop',
//       chromeMediaSourceld: sources[0].id,
//       width,
//       height
//     }
//   }
// });

// 开启摄像头
// navigator.mediaDevices.getUserMedia({
//   audio: false,
//   video: {
//       chromeMediaSource: 'desktop',
//       chromeMediaSourceId: sources[0].id,
//       width: window.screen.width,
//       height: window.screen.height
//   }
// }).then((stream) => {
//     peer.emit('add-stream', stream);
// }).catch((err) => {
//     console.error(err);
// });
```

## 使用robotjs库控制键盘和鼠标

安装robotjs库，再全局安装node-gyp编译库,node-gyp库编译基于python2版本

```bash
npm i -g node-gyp
```

如果有python3版本，指定正确的Python版本：在命令行中使用 `npm config set python 'path-to-python.exe'` 命令来指定正确的Python版本路径，例如：`npm config set python 'C:\Python27\python.exe'`

更新npm：使用 `npm update -g npm` 命令来更新npm到最新版本，以确保它与当前的Python版本兼容。

设置PY环境变量：您可以在计算机上设置PY环境变量为正确的Python版本，以确保node-gyp使用正确的Python版本进行编译。

如果上述步骤无法解决问题，您可能需要卸载Python 3.10并重新安装Python 2.7版本。然后再编译。

---

使用node-gyp库重新编译robotjs再package.json中，加入rebuild命令，每次重新安装node_modules模块都需要重新运行这个命令编译

node-gyp命令的build和rebuild是两个子命令，用于编译本地C++扩展。

node-gyp build命令将编译当前项目的本地C++扩展，在执行该命令之前，必须先运行node-gyp configure命令生成Makefile文件。如果之前已经执行过node-gyp configure命令，则可以直接运行node-gyp build命令进行编译。

相比之下，node-gyp rebuild命令则会重新编译项目的全部本地C++扩展，即使它们已经被编译过了。这个命令通常用于在更改了本地C++扩展代码或更改了Node.js版本或操作系统后进行全面的重建。

因此，node-gyp build与node-gyp rebuild之间的主要区别在于是否强制重新编译全部本地C++扩展。如果只需要编译一个或一部分本地C++扩展，则应该使用node-gyp build命令，否则应该使用node-gyp rebuild命令来确保所有本地C++扩展都被正确地重新编译。

```bash
"scripts": {
  "rebuild": "cd node_modules/robotjs && node-gyp rebuild --runtime=electron --target=23.2.0 --arch=x64 --dist-url=https://electronjs.org/headers install",
  "start:electron": "electron .",
  "start:render": "cd app/renderer/src/main && npm start"
},
```

## 基于WebRTC传输视频流-简单的传输过程

一、控制端

- 1.创建RTCPeerConnection
- 2.发起连接createoffer(得到offer SDP)
- 3.setLocalDescription(设置offer SDP)
- 4.将控制端的offer SDP“发送”给傀儡端

二、傀儡端

- 1.创建RTCPeerConnection
- 2.添加桌面流addstream
- 3.setRemoteDescription(设置控制端offer SDP)
- 4.响应连接createAnswer(得到answer SDP)
- 5.setLocalDescription(设置answer SDP)
- 6.将傀儡端的answer SDP“发送”给控制端

三、控制端

- 1.setRemoteDescription(设置控制端answer SDP)

### SDP

SDP(Session Description Protocol) 是一种会话描述协议，用来描述多媒体会话，主要用于协商双方通讯过程，传递基本信息。
SDP的格式包含多行，每行为`<type>=<value>`
`<type>`：字符，代表特定的属性，比如v，代表版本
`<value>`：结构化文本，格式与属性类型有关，UTF8编码

#### SDP实例截取

```bash
V=0 // sdp版本号，一直为0,RFC4566规定
0=- 2588168131833388577 2IN IP4 127.0.0.1
I/ RFC 4566 0=<username> <sess-id> <sess-version> <nettype> <addrtype> <unicast-address>

t=0 0//两个值分别是会话的起始时间和结束时间，这里都是0代表没有限制

m=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 100 101 102 122 127 121 125 107 108 109 124 120 123 119 114 115 116
// m=video说明本会话包含视频，9代表视频使用端口9来传输//UDP，TLSPTP代表使用UDP来传输RTP包，并使用TLS加密//SAVPF代表使用SRTCP
// 后面数字对应编码，比如video，122代表 H264/90000

a=msid-semantic: WMS gXOE8lLkHawEZsXLKju4FOIDoUardqgEgER
// WMS是WebRTC Media stream简称，这一行对应的就是我们之前的media streamid
```
