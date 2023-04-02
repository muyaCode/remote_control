# 远程控制软件的实现

参考教程：《Electron 开发实战》：<https://time.geekbang.org/course/intro/269>

课件和源码：<https://github.com/dengyaolong/geektime-electron>

## 项目目录说明

- app项目运行目录
  - app/main 目录：electron主进程目录
  - app/renderer 目录：electron页面目录
    - app/renderer/src/main 目录：react项目-傀儡端页面
    - app/renderer/pages 目录：
      - app/renderer/pages/control 目录：控制端页面
      - app/renderer/pages/main 目录：react项目-傀儡端页面编译之后的文件
- signal 目录：信令服务端--傀儡端和控制端的WebSocket通信
- updater-server 目录：软件更新服务端+ 客户端程序崩溃日志收集
- release 目录：electron打包后的软件目录

## 项目如何运行

运行前需要：

- 1.在项目根目录安装依赖
- 2.在react项目目录 `app/renderer/src/main` 安装依赖
- 3.在信令服务器目录 `signal` 内 安装依赖
- 4.运行编译robotjs命令（Node编译依赖于python2版本，所以要预先安装）
- 5.再启动运行react项目，然后运行信令服务端，最后：运行electron

package.json文件的命令详解

- `npm run rm`：删除根目录的node_modules文件夹
- `npm run rebuildRobotjs`：编译robotjs
- `npm run start:render`：运行react项目
- `npm run start:server`：运行信令服务端
- `npm run start:electron`：运行electron
- `npm run build`：打包react项目
- `npm run pack:win`：打包electron软件为win32系统版本
- `npm run pack:mac`：打包electron软件为mac苹果系统版本

```json
  "scripts": {
    "rm":"rm -rf node_modules",
    "rebuildRobotjs": "cd node_modules/robotjs && node-gyp rebuild --runtime=electron --target=23.2.0 --arch=x64 --dist-url=https://electronjs.org/headers install",
    "start:render": "cd app/renderer/src/main && npm start",
    "start:server": "cd ./signal && npm start",
    "start:electron": "electron .",
    "build": "cd app/renderer/src/main && npm run build",
    "pack:win": "npm run build && electron-builder --win",
    "pack:mac": "npm run build && electron-builder --mac --ia32"
  },
```

## 一、项目关键点分析

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

## 二、技术关键点

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

// 也是可以播放桌面流，但该API 已被 从 web 标准中移除
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

## 三、使用robotjs库控制键盘和鼠标

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

## 四、基于WebRTC传输视频流-简单的传输过程---RTCPeerConnection

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

### WebRTC NAT穿透:ICE

CE(Interactive Connectivity Establishment) 交互式连接创建

- 优先STUN(Session Traversal utilities for NAT)，NAT会话穿越应用程序
- 备选TURN(TraversalUsing Relay NAT)，中继NAT实现的穿透。
  - Full Cone NAT - 完全锥形NAT
  - Restricted Cone NAT - 限制锥形NAT
  - Port Restricted Cone NAT 端口限制锥形NAT
  - Symmetric NAT 对称NAT

ICE（Interactive Connectivity Establishment）是WebRTC中用于实现NAT穿透的协议。ICE会尝试使用STUN服务器获取公网IP地址和端口，如果STUN服务器无法连接，则会使用TURN服务器进行中继；如果两者都失败，则表明无法建立直接连接，需要通过信令服务器转发数据。NAT类型包括Full Cone NAT、Restricted Cone NAT、Port Restricted Cone NAT和Symmetric NAT，不同类型的NAT在穿透过程中可能需要不同的策略。

#### STUN 过程

STUN（Session Traversal Utilities for NAT）是WebRTC中用于实现NAT穿透的一种协议。STUN会话由客户端和服务器之间进行，STUN客户端通常是在本地网络中运行的，而STUN服务器则位于公网上。

在STUN过程中，客户端向STUN服务器发送一个请求，请求中包含了客户端的IP和端口信息，服务器收到请求后会将客户端的公网IP和端口返回给客户端。如果客户端无法直接访问STUN服务器，则可以使用ICE（Interactive Connectivity Establishment）协议自动检测并选择可用的STUN服务器。

通过获取公网IP和端口信息，客户端可以将其告知其他对等方，以便建立点对点连接。在建立连接时，对等方可以尝试直接连接客户端的公网地址，如果连接失败，则可以通过TURN服务器进行中继。

- 1.客户端发送STUN请求到STUN服务器。
- 2.服务器将客户端的公网IP和端口信息返回给客户端。
- 3.客户端将其公网地址告知对等方。
- 4.对等方尝试直接连接客户端的公网地址，如果连接成功，则建立点对点连接；如果连接失败，则尝试使用TURN服务器进行中继。
- 5.如果中继也无法建立连接，则需要通过信令服务器转发数据。

### 搭建信令服务

信令服务：WebRTC客户端(对等端)之间传递消息的服务器--消息转发

#### 服务端需求

1.处理业务逻辑

- 建立端与控制码的联系
- 通过控制码找到用户

2.转发 offer SDP、answer SDP、iceCandidate

- 处理客户端请求
- 主动推送消息给客户端

#### 技术对比和选型

|          | 短轮询               | 长轮询               | WebSocket                                | sse                                |
| -------- | -------------------- | -------------------- | ---------------------------------------- | ---------------------------------- |
| 通讯方式 | http                 | http                 | 基于TCP长连接通讯                        | http                               |
| 触发方式 | 轮询                 | 轮询                 | 事件                                     | 事件                               |
| 优点     | 简单，兼容性好       | 相对短轮询资源占用少 | 全双工通讯，性能好安全，扩展性           | 实现简单，开发成本低               |
| 缺点     | 安全性差，资源占用高 | 安全性差，资源占用高 | 传输数据需要进行二次解析，有一定开发门槛 | 适用于高级浏览器                   |
| 适用范围 | B/S服务              | B/S服务              | 网游、支付、IM等                         | 服务端到客户端推送（如新消息推送） |

这个项目选用的是 **WebSocket** 技术栈

##### 服务端实现 WebSocket 服务器 (基于Node.js)

安装 `ws` 库：[ws - npm (npmjs.com)](https://www.npmjs.com/package/ws)

```bash
npm install ws -save
```

基本使用

```js
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8010 });
wss.on('connection', function connection() {
  ws.on('message', function incoming(msg) {
    // 响应客户端send事件
    
  });
  
  ws.on('close', function() {
    // 响应客户端close事件
    
  });

  ws.send('推送内容'); // 发送内容到客户端
});
```

##### 处理业务逻辑

- 建立端与控制码的联系
  - 通过控制码找到用户
  - 业务逻辑实现

##### Websocket服务端的实现

1.新建一个服务端文件夹目录：signal，使用 `npm init` 初始化项目

2.新建index.js

```js
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8010 });
const code2ws = new Map();

wss.on('connection', function connection(ws, request) {
  // ws => 端
  let code = Math.floor(Math.random()*(999999-100000)) + 100000;
  code2ws.set(code, ws);

  ws.sendData = (event, data) => {
    ws.send(JSON.stringify({event, data}));
  }

  ws.on('message', function incoming(message) {
    // 响应客户端send事件
    console.log('imcoming', message);
    // {event, data}
    let parsedMessage = {};
    try{
      parsedMessage = JSON.parse(message);
    } catch(e) {
      ws.sendError('消息传递错误');
      console.log('消息错误：', e);
      return;
    }
    let {event, data} = parsedMessage;

    if(event === 'login') { // 登录逻辑
      ws.sendData('logined', { code });
    } else if(event === 'control') { // 控制逻辑
      let remote = +data.remote;
      if(code2ws.has(remote)){
        ws.sendData('controlled', { remote });
        ws.sendRemote = code2ws.get(remote).sendData;
        ws.sendRemote('be-controlled', { remote: code });
      }
    } else if(event === 'forward') {
      // data = { event, data }
      ws.sendRemote(data.event, data.data);
    }
  });
  
  ws._closeTimeout = setTimeout(() => {
    ws.terminate();
  }, 10 * 60 * 1000);
  ws.on('close', function() {
    // 响应客户端close事件
    code2ws.delete(code);
    clearTimeout(ws._closeTimeout);
  });
});
```

3.使用工具测试是否通：[Websocket在线测试 在线小工具网站 (p2hp.com)](http://tool.p2hp.com/tool-online-runwebsocket/)

- 使用的网址和端口：`ws://127.0.0.1:8010`
- 连接之后发送内容：`{"event": "login"}`

##### 浏览器使用 Websocket

1.安装 `ws` 库

```bash
npm install ws -save
```

2.基本使用

```js
const WebSocket = require('ws');
const ws = new WebSocket('http://localhost:8081');
```

3.业务逻辑改变

```bash
ipcMain login ===> signal.send('login') && signal.on('logined')
ipcMain control ===> signal.on('controlled') && signal.on('be-controlled')
```

4.信令逻辑改便

```bash
window.createAnswer ===> signal.send('forward') && signal.on('offer')
window.setRemote ===> signal.send('forward) && signalon('answer')
window.addlceCandidate ===> signal.send('forward') && signal.send('iceCandidate')
```

## 五、指令传输---RTCDataChannel

控制端 —> 指令传输JSON字符串 —> 傀儡端

使用robot.js

鼠标点击

```js
{
    type: 'mouse',
    data: {
        clientX: 13,
        clientY: 22,
        wideo: {
            width: 600,
            height: 800
        }
    }
}
```

键盘输入

```js
{
    type: 'key',
    data: {
        shift: true,
        keyCode: 37,
        meta: true,
        control: true,
        alt: false
    }
}
```

### 传输方式(两种)

- 1.通过信令服务
- **2.基于WebRTC的RTCDataChannel**（项目中使用）
  - 无服务端依赖，P2P传输
  - 基于SCTP(传输层，有着TCP、UDP的优点)

### 基于WebRTC的RTCDataChannel的基本用法

```js
const pc = new RTCPeerConnection();
const dc = pc.createDataChannel("robotchannel"); // 创建一个datachannel
// 接收消息
dc.onmessage = function(event) {
    console.log("received:" + event.data);
}
// 建立成功
dc.onopen = function () {
    console.log("datachannel open");
}
// 关闭
dc.onclose = function (){
    console.log("datachannel close");
}
// 发送消息
dc.send('text);
// 关闭
dc.close(); 
// 发现新的datachannel
pc.ondatachannel = function(e){
    
}
```

### RTCDataChannel的过程

控制端

- 1.pc.createDataChannel在连接中新增数据通道)
- 2.open事件触发(数据通道成功)
- 3.channel.send发送指令

傀儡端

- 1.pc.ondatachannel(发现新数据通道传输)
- 2.e.channel.onmessage(监听数据通道消息)
- 3.响应指令

### 更改以前代码

#### 业务逻辑

- ipcMain login
- ipcMain control

#### 信令逻辑

- window.createAnswer
- window.setRemote
- window.addlceCandidate
- robot
