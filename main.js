
const { app, BrowserWindow, ipcMain } = require('electron')
const bhapticsPlayer = require('./src/bhapticsPlayer')
const dev = true

const start = (webContents) => {
  const player = new bhapticsPlayer((channel, args) => {
    if ((typeof webContents.send) === 'function') {
      webContents.send(channel, args)
    } else {
      console.log('can send event')
    }
  })

  ipcMain.on('find-ip', function (event, arg) {
    player.findIp(arg)
  })

  ipcMain.on('define-ip', function (event, arg) {
    player.defineGameIp(arg)
  })

  ipcMain.on('save-config', function () {
    player.save()
  })

  player.launch()
}

const createWindow = () => {
  console.log('window create')
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
      .then(() => {
        dev && mainWindow.webContents.openDevTools()
        start(mainWindow.webContents)
      })
      .catch((err) => console.error(err))
  // comment for prod Version
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    BrowserWindow.getAllWindows().length === 0 && createWindow()
  })
})

app.on('window-all-closed', function () {
  process.platform !== 'darwin' && app.quit()
})
