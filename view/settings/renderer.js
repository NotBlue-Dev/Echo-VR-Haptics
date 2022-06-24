const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const replaceText = (selector, text) => {
  const element = document.querySelector(selector);
  element && (element.innerText = text);
};

window.addEventListener('DOMContentLoaded', () => {
  fs.readFile(path.join(__dirname, '../../package.json'), 'utf8', (err, data) => {
    replaceText('#appversion', JSON.parse(data).version);
  });

  function createBox(names, file, status, intens, lock) {
    const box = document.createElement('div');
    box.setAttribute('class', 'box');

    const name = document.createElement('span');
    name.id = 'name';
    name.textContent = names;

    box.appendChild(name);

    const inputElement = document.createElement('input');
    inputElement.setAttribute('type', 'range');
    inputElement.value = intens;
    inputElement.max = '5';
    inputElement.min = '0';
    inputElement.setAttribute('class', 'slider');

    inputElement.addEventListener('change', () => {
      ipcRenderer.send('change-setting', {
        effect: names,
        intensity: inputElement.value,
      });
    }, false);

    box.appendChild(inputElement);

    const nameFile = document.createElement('span');
    nameFile.id = 'nameFile';
    nameFile.textContent = file;
    box.appendChild(nameFile);

    const node = document.createTextNode('Play');
    const txt = document.createElement('a');
    txt.appendChild(node);
    const btn = document.createElement('div');
    btn.setAttribute('class', 'btn');
    btn.addEventListener('click', () => {
      ipcRenderer.send('play-effect', {
        effect: names,
      });
    });
    btn.appendChild(txt);
    box.appendChild(btn);

    const options = document.createElement('span');
    options.setAttribute('class', 'end');

    if (status === true) {
      options.id = 'green';
      options.textContent = 'enable';
    } else {
      options.id = 'red';
      options.textContent = 'disable';
    }

    // remove condition lock when everything will be implemented
    if (lock === true) {
      options.id = 'red';
      options.textContent = 'Not Yet';
    }

    // NEED TO SAVE
    options.addEventListener('click', () => {
      if (options.textContent === 'Not Yet') {
        return;
      }
      const state = (options.id === 'green');
      const enable = !state;

      options.textContent = enable ? 'enable' : 'disable';
      options.id = enable ? 'green' : 'red';
      ipcRenderer.send('change-setting', {
        effect: names,
        enable,
      });
    });

    box.appendChild(options);

    const container = document.getElementById('container');
    container && container.appendChild(box);
  }

  const save = document.getElementById('save');
  save && save.addEventListener('click', () => {
    ipcRenderer.send('save-config');
    window.location.href = '../main/index.html';
  });

  const reset = document.getElementById('reset');
  reset && reset.addEventListener('click', () => {
    const div = document.getElementById('container');
    while (div.firstChild) {
      div.firstChild.remove();
    }
    ipcRenderer.send('default-settings');
  });

  const close = document.getElementById('close');
  close && close.addEventListener('click', () => {
    window.location.href = '../main/index.html';
  });

  const displaySettings = (settings) => {
    for (const [name, effect] of Object.entries(settings)) {
      createBox(name, `${name}.tact`, effect.enable, effect.intensity, effect.lock);
    }
  };

  ipcRenderer.on('settings-updated', (event, arg) => {
    displaySettings(arg);
  });

  ipcRenderer.send('get-settings');
});
