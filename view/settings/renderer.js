const {remote} = require('electron');
const win = remote.BrowserWindow.getFocusedWindow();
const fs = require('fs')
const bhaptic = require('../../js/tact.js');
const tactJs = require('../../js/tact-js/tact-js.umd.js')

let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
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

    fs.readFile('./package.json', 'utf8', function(err, data){
        replaceText('#appversion', JSON.parse(data).version)
    });

    function createBox(names, file, status, intens) {
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
        


        //NEED TO SAVE
        options.addEventListener('click', e => {
            index = config.files.findIndex(x=>x.name === names)
            if(options.id == 'green') {
                options.textContent='disable';
                options.id = "red"
                config.files[index].state = false
            } else {
                options.textContent='enable';
                options.id = "green"
                config.files[index].state = true
            }
            
            
        })

        box.appendChild(options)

        document.getElementById("container").appendChild(box); 
    }

    config.files.forEach((value) => {
        createBox(value.name, value.file, value.state, value.intens)
    })

    let save = document.querySelector('#save')

    save.addEventListener('click', e => {
        fs.writeFile('./config.json', JSON.stringify(config), (err) => {
            if (err) console.error;
        });
        window.location.href = "../main/index.html";
    })

    let reset = document.querySelector('#reset')

    reset.addEventListener('click', e => {
        const div = document.querySelector('#container')
        while(div.firstChild) div.firstChild.remove()
        config = JSON.parse(fs.readFileSync('./assets/default.json', 'utf8'))
        config.files.forEach((value) => {
            createBox(value.name, value.file, value.state, value.intens)
        })
    })

    let close = document.querySelector('#close')

    close.addEventListener('click', e => {
        window.location.href = "../main/index.html";
    })

})



