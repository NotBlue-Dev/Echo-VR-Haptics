const { remote, ipcRenderer } = require('electron');
const win = remote.BrowserWindow.getFocusedWindow();
const fs = require('fs')

const path = require('path');
const prompt = require("electron-prompt");

let ip;

let config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json'), 'utf8'))

let options = {}

config.files.forEach((value) => {
    options[value.name] = value.state
})

ip = config.ip;

//electron

const replaceText = (selector, text, color) => {
    const element = document.querySelector(selector)
    element && (element.innerText = text)
    element && color && (element.style.color = color)
}

const logInElement = (console, element) => {
    if (!console) {
        console = {};
    }
    console.log = function (message) {
        let d = new Date();
        let n = d.toLocaleTimeString();
        if (typeof message == 'object') {
            element.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : String(message)) + '<br />';
        } else {
            element.innerHTML += "[" + n + "] " + message + '<br />';
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    logInElement(console, document.getElementById('logging'))

    let opts = document.querySelector('#opts')

    opts.addEventListener('click', e => {
        window.location.href = "../settings/index.html";
    })

    fs.readFile(path.join(__dirname, '../../package.json'), 'utf8', function(err, data){
        replaceText('#appversion', JSON.parse(data).version)
    });
    
    let close = document.querySelector("#close");
    close.addEventListener("click", () => {
        win.close();
    });

    let find = document.querySelector("#find");
    find.addEventListener("click", () => {
        prompt({
            title: 'Quest or PC',
            label: 'Enter your device (Quest or PC)',
            value: '',
            type: 'input'
        }).then((response) => {
            const body = document.querySelector("#body");
            body && (body.style.cursor = "progress");
            ipcRenderer.send('find-ip', response)
        })
    });

    ipcRenderer.on('tact-device-connecting', (event, arg) => {
        console.log('Connecting…')
    })

    ipcRenderer.on('tact-device-connected', (event, arg) => {
        console.log('Connected to Bhaptic Player')
        replaceText('#statusHaptic', 'Running and ready to go', '#00D832')
    })

    ipcRenderer.on('tact-device-disconnected', (event, arg) => {
        console.log('/!\\ Disconnected')
        replaceText('#statusHaptic', 'Not Running !', '#FFBB00')
    })

    ipcRenderer.on('tact-device-fileLoaded', (event, arg) => {
        console.log(`File loaded ${arg}`)
    })

    ipcRenderer.on('game-ip-defined', (event, arg) => {
        replaceText('#statusIP', arg, '#00D832')
        ipcRenderer.send('save-config')
    })

    ipcRenderer.on('game-ip-bad-defined', (event, arg) => {
        replaceText('#statusIP', arg, '#ff3920')
    })

    ipcRenderer.on('find-ip-canceled', (event, arg) => {
        console.log('canceled')
        const body = document.querySelector("#body");
        body && (body.style.cursor = "default");
        console.log('user cancelled')
    })

    ipcRenderer.on('find-ip-failed', (event, arg) => {
        console.log('failed')
        console.log(arg)
        const body = document.querySelector("#body");
        body && (body.style.cursor = "default");
        prompt({
            title: "Can't find IP, enter manually",
            label: 'Enter Quest IP',
            value: '',
            type: 'input'
        }).then((response) => {
            ipcRenderer.send('define-ip', response)
        })
    })

    ipcRenderer.on('find-ip-timeout', (event, arg) => {
        console.log('timeout')
        const body = document.querySelector("#body");
        body && (body.style.cursor = "default");
        prompt({
            title: "Can't find IP, enter manually",
            label: 'Enter Quest IP',
            value: '',
            type: 'input'
        }).then((response) => {
            ipcRenderer.send('define-ip', response)
        })
    })
})
