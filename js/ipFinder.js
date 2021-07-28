const prompt = require('electron-prompt');
const arp = require('arp')
const oui = require('oui')
const fs = require('fs')
const {remote} = require('electron');

let ip;
let type;
let pseudo;



function find() {

    ip = config.ip;
    pseudo = config.pseudo;


    //if pseudo and ip already defined reset so you can change
    if(ip != undefined && ip != '' && pseudo != undefined && pseudo != "") ip = '', pseudo = ""

    return new Promise((resolve, reject) => {
        function findip() {
            prompt({
                title: 'Quest or PC',
                label: 'Enter your device',
                value: '',
                type: 'input'
            })
            .then((r) => {
                if(r === null) {
                    console.log('user cancelled');
                } else {
                    type = r.toLowerCase()
                    if(type == "quest") {
                        for(let i = 1; i<254; i++) {
                            if(ip == undefined) {
                                arp.getMAC(`192.168.1.${i}`, function(err, mac) {
                                    if(err) return;
                                    let a = oui(mac)
                                    try{
                                        if(a.split(' ')[0] == 'Oculusss') {
                                            ip = `192.168.1.${i}`
                                        }
                                    } catch {}
                                });
                            }  
                        }
        
                        setTimeout(() => {
                            if(ip == undefined || ip == '') {
                                prompt({
                                    title: "Can't find IP, enter manually",
                                    label: 'Enter Quest IP',
                                    value: 'eg: 192.168.1.53',
                                    type: 'input'
                                })
                                .then((r) => {
                                    if(r === null) {
                                        console.log('user cancelled');
                                    } else {
                                        ip = r
                                        check()
                                    }
                                })
                                .catch(console.error);
                            } else {
                                console.log('Quest found ! ' + ip)
                                check()
                            }
                            
                        }, 10000);
                        
                    } else {
                        ip = 'localhost'
                        check()
                    }
                }
            })
            .catch(console.error);
        }

        if(ip == undefined || ip == "") {
            findip() 
            console.log('search ip')
        } else {
            console.log('ip in json')
            check()
        }

        function names() {
            prompt({
                title: 'Pseudo',
                label: 'Enter your pseudo',
                value: '',
                type: 'input'
            })
            .then((r) => {
                if(r === null) {
                    console.log('user cancelled');
                } else {
                    pseudo = r;
                    config.pseudo = pseudo
                    config.ip = ip
                    fs.writeFile('./config.json', JSON.stringify(config), (err) => {
                        if (err) console.error;
                    });
                    resolve({"ip":ip, "pseudo":pseudo});
                }
            })
            .catch(console.error);
        }

        function check() {
            if(pseudo == undefined || pseudo == "") {
                names() 
                console.log('search pseudo')
            } else {
                console.log('pseudo in json')
                config.ip = ip
                fs.writeFile('./config.json', JSON.stringify(config), (err) => {
                    if (err) console.error;
                });
                resolve({"ip":ip, "pseudo":pseudo});
            }
        }
    });
}

module.exports = function() {

    return find()

}