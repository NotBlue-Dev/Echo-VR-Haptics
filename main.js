
const {app, BrowserWindow} = require('electron')
const path = require('path')

function createWindow () {

  const mainWindow = new BrowserWindow({
    width:685,
    height:850,
    resizable:false,
    minimizable : false,
    maximizable : false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    frame:false,
    title:'haptic',
  })
  mainWindow.loadFile('./view/main/index.html')
  // comment for prod Version
  //mainWindow.webContents.openDevTools()
  
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
