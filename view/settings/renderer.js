const {remote} = require('electron');
const win = remote.BrowserWindow.getFocusedWindow();
const fs = require('fs')
const bhaptic = require('../../js/tact.js');
const tactJs = require('../../js/tact-js/tact-js.umd.js')
const path = require('path');

let config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json'), 'utf8'))
let index;

const replaceText = (selector, text) => {
    const element = document.querySelector(selector)
    if (element) element.innerText = text
}

bhaptic().then((txt) => {
    if(txt != true) {
        console.log('Bhaptic player as an issue');  
    } else {
        console.log('Connected to Bhaptic Player')
    }
})

window.addEventListener('DOMContentLoaded', () => {

    fs.readFile(path.join(__dirname, '../../package.json'), 'utf8', function(err, data){
        replaceText('#appversion', JSON.parse(data).version)
    });

    function createBox(names, file, status, intens, lock) {
        let box = document.createElement("div");
        box.setAttribute('class', 'box');

        let name = document.createElement("SPAN");
        name.id = "name"
        name.textContent=names;

        box.appendChild(name)

        let inp = document.createElement("INPUT");
        inp.setAttribute("type", "range");
        inp.value = intens
        inp.max = "5"
        inp.min = "0"
        inp.setAttribute('class', 'slider')

        inp.addEventListener("change", function() {
            let val = inp.value
            if(val == 0) val = 0.2
            index = config.files.findIndex(x=>x.name === names)
            config.files[index].intens = parseFloat(val)
        }, false);

        box.appendChild(inp)

        let nameFile = document.createElement("SPAN");
        nameFile.id = "nameFile"
        nameFile.textContent=file;

        box.appendChild(nameFile)

        let btn = document.createElement("div");
        btn.setAttribute('class', 'btn');

        let txt = document.createElement("a");

        let node = document.createTextNode("Play");

        btn.addEventListener('click', e => {
            tactJs.default.submitRegistered(names)
        })

        txt.appendChild(node);

        btn.appendChild(txt)
        box.appendChild(btn)

        let options = document.createElement("SPAN");
        options.setAttribute('class', 'end');

        if(status==true) {
            options.id = "green"
            options.textContent='enable';
        } else {
            options.id = "red"
            options.textContent="disable";
        }

        //remove condition lock when everything will be implemented
        if(lock == true) {
            options.id = "red"
            options.textContent="Not Yet";
        }

        


        //NEED TO SAVE
        options.addEventListener('click', e => {
            index = config.files.findIndex(x=>x.name === names)
            //remove condition not yet when everything will be implemented
            if(options.textContent!="Not Yet") {
                if(options.id == 'green') {
                    options.textContent='disable';
                    options.id = "red"
                    config.files[index].state = false
                } else {
                    options.textContent='enable';
                    options.id = "green"
                    config.files[index].state = true
                }
            }
            
            
        })

        box.appendChild(options)

        document.getElementById("container").appendChild(box); 
    }

    config.files.forEach((value) => {
        createBox(value.name, value.file, value.state, value.intens, value.lock)
    })

    let save = document.querySelector('#save')

    save.addEventListener('click', e => {
        fs.writeFile(path.join(__dirname, '../../config.json'), JSON.stringify(config), (err) => {
            if (err) console.error;
        });
        window.location.href = "../main/index.html";
    })

    let reset = document.querySelector('#reset')

    reset.addEventListener('click', e => {
        const div = document.querySelector('#container')
        while(div.firstChild) div.firstChild.remove()
        config.files = JSON.parse(fs.readFileSync(path.join(__dirname, '../../assets/default.json'), 'utf8'))
        console.log(config.files)
        config.files.forEach((value) => {
            createBox(value.name, value.file, value.state, value.intens, value.lock)
        })
    })

    let close = document.querySelector('#close')

    close.addEventListener('click', e => {
        window.location.href = "../main/index.html";
    })

})



