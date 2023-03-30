const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });
const code2ws = new Map();

wss.on('connection', function connection(ws, request) {
  // ws => 端
  let code = Math.floor(Math.random()*(999999-100000)) + 100000;
  code2ws.set(code, ws);
  ws.sendData = (event, data) => {
    ws.send(JSON.stringify({event, data}));
  }

  ws.on('message', function incoming(msg) {
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
    if(event === 'login') {
      ws.send('logined', { code });
    }
  });
  
  ws.on('close', function() {
    // 响应客户端close事件
    
  });

  ws.send('推送内容'); // 发送内容到客户端
});