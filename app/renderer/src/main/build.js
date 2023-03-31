const fs = require('fs-extra');
const dest = '../../page/main';

// 移除目标文件夹
fs.removeSync(dest);
// 将 build 文件夹移动到目标位置
fs.moveSync('./build', dest);
