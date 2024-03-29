const { remote, ipcRenderer } = require('electron');

const win = remote.BrowserWindow.getFocusedWindow();
const fs = require('fs');

const path = require('path');
const prompt = require('electron-prompt');

// electron

const replaceText = (selector, text, color) => {
  const element = document.querySelector(selector);
  element && (element.innerText = text);
  element && color && (element.style.color = color);
};

const logInElement = (console, element) => {
  if (!console) {
    console = {};
  }
  console.log = function (message, register = true) {
    register && ipcRenderer.send('log', message);
    const d = new Date();
    const n = d.toLocaleTimeString();
    if (typeof message === 'object') {
      element.innerHTML += `${JSON && JSON.stringify ? JSON.stringify(message) : String(message)}<br />`;
    } else {
      element.innerHTML += `[${n}] ${message}<br />`;
    }
  };
};

window.addEventListener('DOMContentLoaded', () => {
  logInElement(console, document.getElementById('logging'));

  const optionsElement = document.getElementById('opts');
  optionsElement && optionsElement.addEventListener('click', () => {
    window.location.href = '../settings/index.html';
  });

  fs.readFile(path.join(__dirname, '../../package.json'), 'utf8', (err, data) => {
    replaceText('#appversion', JSON.parse(data).version);
  });

  const closeElement = document.getElementById('close');
  closeElement && closeElement.addEventListener('click', () => {
    win.close();
  });

  const findIpElement = document.getElementById('find');
  findIpElement && findIpElement.addEventListener('click', () => {
    prompt({
      title: 'Quest or PC',
      label: 'Enter your device (Quest or PC)',
      value: '',
      type: 'input',
    }).then((response) => {
      console.log(response)
      const body = document.querySelector('#body');
      body && (body.style.cursor = 'progress');
      ipcRenderer.send('find-ip', response);
    });
  });

  ipcRenderer.on('tact-device-connecting', () => {
    console.log('Connecting…');
  });

  ipcRenderer.on('tact-device-connected', (arg) => {
    const name = arg.name || 'Haptic';
    console.log(`Connected to ${name}`);
    replaceText('#statusHaptic', 'Running and ready to go', '#00D832');
  });

  ipcRenderer.on('tact-device-disconnected', () => {
    console.log('/!\\ Disconnected');
    replaceText('#statusHaptic', 'Not Running !', '#FFBB00');
  });

  ipcRenderer.on('tact-device-fileLoaded', (event, arg) => {
    console.log(`File loaded ${arg}`);
  });

  ipcRenderer.on('game-ip-defined', (event, arg) => {
    replaceText('#statusIP', arg, '#00D832');
    const body = document.querySelector('#body');
    body && (body.style.cursor = 'auto');
    ipcRenderer.send('save-config');
  });

  ipcRenderer.on('game-ip-bad-defined', (event, arg) => {
    replaceText('#statusIP', arg, '#ff3920');
  });

  ipcRenderer.on('find-ip-canceled', () => {
    console.log('canceled');
    const body = document.querySelector('#body');
    body && (body.style.cursor = 'default');
    console.log('user cancelled');
  });

  ipcRenderer.on('find-ip-failed', (event, arg) => {
    console.log('failed');
    console.log(arg);
    const body = document.querySelector('#body');
    body && (body.style.cursor = 'default');
    prompt({
      title: "Can't find IP, enter manually",
      label: 'Enter Quest IP',
      value: '',
      type: 'input',
    }).then((response) => {
      ipcRenderer.send('define-ip', response);
    });
  });

  ipcRenderer.on('find-ip-timeout', () => {
    console.log('timeout');
    const body = document.querySelector('#body');
    body && (body.style.cursor = 'default');
    prompt({
      title: "Can't find IP, enter manually",
      label: 'Enter Quest IP',
      value: '',
      type: 'input',
    }).then((response) => {
      ipcRenderer.send('define-ip', response);
    });
  });

  ipcRenderer.on('data-updated', (event, arg) => {
    replaceText('#statusIP', arg.statusIp, arg.statusIpValid ? '#00D832' : '#ff3920');
    replaceText('#statusHaptic', arg.statusHaptic ? 'Running and ready to go' : 'Not Running !', arg.statusHaptic ? '#00D832' : '#FFBB00');
    arg.logs.forEach((message) => console.log(message, false));
  });

  ipcRenderer.send('get-data');
});
