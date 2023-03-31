const openAboutWindow = require("about-window");
const path = require("path");

// 原生窗口相关设置
const createOpenAboutWindow = () => 
  openAboutWindow({
    icon_parh: path.join(__dirname, 'icon.png'), // 图标路径
    package_json_dir: path.resolve(__dirname, "/../../../"), // 根目录package.json路径
    cropyright: "Cropyright (c) 2023 muya", // 版权
    homePage: "https://github.com/muyaCode/remote_control", // 图标跳转连接
  });

module.exports = { createOpenAboutWindow };
