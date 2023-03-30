const { desktopCapturer, ipcMain } = require('electron');

function getDesktopCapturerSources () {
  ipcMain.handle(
    'DESKTOP_CAPTURER_GET_SOURCES',
    () => {
      return desktopCapturer.getSources({ types: ['screen'] });
    }
  )
}

module.exports = getDesktopCapturerSources;
