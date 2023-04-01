const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const server = require('koa-static-server');
const compareVersions = require('compare-versions');

// 获取最新的版本
function getNewVersion(versions) {
  if(!versions) return null;

  let maxVersion = {
    name: '1.0.1',
    pub_date: '2023-02-01T12:26:53+1:00',
    notes: '新增功能',
    url: 'http://127.0.0.1:3385/public/remote_control-1.0.1-mac.zip'
  }
  if(compareVersions.compare(maxVersion.name, versions, '>')) {
    return maxVersion;
  }
  return null;
}

router.get('/adrwin', (ctx, next) => {
  // 处理Mac更新，请求后缀：?version=1.0.0&uid=123
  const { version } = ctx.query;
  let newVersion = getNewVersion(version);

  if(newVersion) {
    ctx.body = newVersion;
  } else {
    ctx.status = 204;
  }
});

app.use(server({
  rootDir: 'public',
  rootPath: '/public'
}));
app.use(router.routes())
   .use(router.allowedMethods());

const port = 33855
app.listen(port, () => {
  console.log(`软件更新服务运行在：http://localhost: ${port}`);
});
