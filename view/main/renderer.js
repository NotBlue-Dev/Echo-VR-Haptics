const {remote} = require('electron');
const win = remote.BrowserWindow.getFocusedWindow();
const ipFinder = require('../../js/ipFinder.js');
const bhaptic = require('../../js/tact.js');
const fs = require('fs')
const WebSocket = require('ws');

const path = require('path');

let ip;
let pseudo;
let pause = false;

let config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json'), 'utf8'))

let options = {}

config.files.forEach((value) => {
    options[value.name] = value.state
})

ip = config.ip;
pseudo = config.pseudo;

bhaptic().then((txt) => {
    if(txt != true) {
        console.log('Bhaptic player as an issue');  
    } else {
        console.log('Connected to Bhaptic Player')
    }
})

//electron

const replaceText = (selector, text) => {
    const element = document.querySelector(selector)
    if (element) element.innerText = text
}

window.addEventListener('DOMContentLoaded', () => {

    //check if bhaptic player reply to ping
    check(true)

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
        pause = true;
        ipFinder().then((obj)=> {
            ip = obj.ip;
            pseudo = obj.pseudo;
            win.reload()
            pause = false;
        }).catch((err)=> {
            if(err == 'cancel') {
                ip = config.ip
                pseudo = config.pseudo
            } else {
                ip = err
                pseudo = config.pseudo
                playId(true)
                check(false)
                pause = false;
            }
        })
    });

    //logging
    (function () {
        if (!console) {
            console = {};
        }
        const old = console.log;
        const loggers = document.querySelector('#logging');
        console.log = function (message) {
            let d = new Date();
            let n = d.toLocaleTimeString();
            if (typeof message == 'object') {
                loggers.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : String(message)) + '<br />';
            } else {
                loggers.innerHTML += "[" + n + "] " + message + '<br />';
            }
            
        }
    })();

})

let ipState = false;
let nickState = false;
let hapticState = false;

function check(bool) {

    const ws = new WebSocket('ws://127.0.0.1:15881/v2/feedbacks?app_id=com.bhaptics.designer2&app_name=bHaptics Designer');

    ws.on('open', function open() {
        replaceText('#statusHaptic', 'Running and ready to go')
        let element = document.querySelector('#statusHaptic')
        element.style.color = '#00D832'
        hapticState = true;
        if(hapticState && nickState && ipState && bool == true) {
            request()
        }
    });

    ws.on('error', (error) => {
        replaceText('#statusHaptic', 'Not Running !')
        let element = document.querySelector('#statusHaptic')
        element.style.color = '#FFBB00'
    })

    if(config.ip != undefined && config.ip != '') {
        replaceText('#statusIP', config.ip )
        let element = document.querySelector('#statusIP')
        element.style.color = '#00D832'
        ipState = true;
    }
    
    if(config.pseudo != undefined && config.pseudo != '' && checks != false) {
        replaceText('#statusName', config.pseudo )
        let element = document.querySelector('#statusName')
        element.style.color = '#00D832'
        nickState = true;
    }

    setTimeout(() => {
        ws.close()
    }, 3000);
}

setInterval(() => {
    check(false)
}, 3000);