const { app, Menu, Tray } = require("electron");
const { resolve } = require("path");
const { showMainWindow } = require("../win/mainWin");
const { createOpenAboutWindow } = require("../win/about");

// windows系统托盘和顶部菜单
app.whenReady().then(() => {
	let tray = new Tray(resolve(__dirname, "./icon_win32.png"));
  // 托盘单击显示主窗口
  tray.on("click", () => {
    showMainWindow();
  });
  // 托盘右键点击事件
	tray.on("right-click", () => {
    const contextMenu = Menu.buildFromTemplate([
      { label: "打开" + app.name, click: showMainWindow },
      { label: "关于" + app.name, click: createOpenAboutWindow },
      { label: "separator" },
      { label: "退出" + app.name, click: () => { app.quit(); } },
    ]);
    tray.setContextMenu(contextMenu);
    let menu = Menu.buildFromTemplate([]);
    app.applicationMenu = menu;
  });
});
