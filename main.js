const { app, BrowserWindow, ipcMain } = require('electron')
const TactPlayer = require('./src/tactPlayer')
const ipFinder = require('./src/ipFinder')
const ConfigLoader = require('./src/configLoader')
const BHapticsTactJsAdapter = require('./src/tact/bHapticsTactJsAdapter')
require('dotenv').config()
const dev = (process.env.NODE_ENV === 'development')

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

  const configLoader = new ConfigLoader(__dirname)

  const player = new TactPlayer(BHapticsTactJsAdapter, ipFinder, configLoader, sendEvent, listenEvent)
  player.launch()
}

const createWindow = () => {
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
