const { crashReporter } = require('electron');
// electron程序崩溃日志上传
function crashReporterInit() {
  crashReporter.start({ submitURL: 'http://127.0.0.1:33855/crash' });
}

module.exports = { crashReporterInit };