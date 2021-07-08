const {app, BrowserWindow} = require('electron')
const path = require('path')


function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })
  mainWindow.setMinimumSize(1300, 750);
  mainWindow.openDevTools({detach:true});
  mainWindow.loadFile('index.html');
}

app.allowRendererProcessReuse = false;
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

