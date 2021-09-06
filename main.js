const { app, BrowserWindow, ipcMain } = require('electron')
const bhapticsPlayer = require('./src/bhapticsPlayer')
const dev = true

const start = (webContents) => {
  const sendEvent = (channel, args) => {
    if ((typeof webContents.send) === 'function') {
      webContents.send(channel, args)
    } else {
      console.log('can not send event')
    }
  }

  const listenEvent = (channel, callable) => {
    ipcMain.on(channel, function (event, arg) {
      callable(arg, event)
    })
  }

  const player = new bhapticsPlayer(sendEvent, listenEvent)
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
}

app.allowRendererProcessReuse = false;

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    BrowserWindow.getAllWindows().length === 0 && createWindow()
  })
})

app.on('window-all-closed', function () {
  process.platform !== 'darwin' && app.quit()
})
