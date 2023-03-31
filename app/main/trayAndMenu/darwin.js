const { app, Menu, Tray } = require("electron");
const path = require("path");
const { showMainWindow } = require('../win/mainWin');
const { createOpenAboutWindow } = require("../win/about");

// Mac系统托盘和顶部菜单
let tray;
function setTray() {
	tray = new Tray(path.resolve(__dirname, "./icon_darwin.png"));
  // 托盘单击显示主窗口
	tray.on("click", () => {
		showMainWindow();
	});
  // 托盘右键点击事件
	tray.on("right-click", () => {
		const contextMenu = Menu.buildFromTemplate([
			{
				label: "显示",
				click: showMainWindow(),
			},
			{
				label: "退出",
				click: app.quit(),
			},
		]);
		tray.popUpContextMenu(contextMenu);
	});
}

// 设置菜单方法
function setAppMenu() {
	let appMenu = Menu.buildFromTemplate([
		{
			label: app.name,
			submenu: [
				{
					label: "关于",
					click: createOpenAboutWindow,
				},
				{ type: "separator" },
				{ type: "services" },
				{ type: "separator" },
				{ type: "hide" },
				{ type: "separator" },
				{ type: "unhide" },
				{ type: "separator" },
				{ type: "quit" },
			],
		},
    // 快捷键：如 command + w 关闭窗口 等
		{ role: "fileMenu" },
    // 快捷键 command + ~ 应用切换 等
		{ role: "windowMenu" },
		// 鼠标快捷键：复制粘贴
		{ role: "editMenu" },
	]);
  // 设置菜单
	app.applicationMenu = appMenu;
}

app.whenReady().then(() => {
	setTray();
	setAppMenu();
});
