const prompt = require('electron-prompt');
const arp = require('arp')
const oui = require('oui')

let type;


function find() {

    let body = document.querySelector("#body");

    ip = config.ip;
    pseudo = config.pseudo;

    //if pseudo and ip already defined reset so you can change
    if(ip != undefined && ip != '' && pseudo != undefined && pseudo != "") ip = '', pseudo = ""

    return new Promise((resolve, reject) => {
        function findip() {
            prompt({
                title: 'Quest or PC',
                label: 'Enter your device (Quest or PC)',
                value: '',
                type: 'input'
            })
            .then((r) => {
                if(r === null) {
                    console.log('user cancelled');
                    reject('cancel')
                } else {
                    type = r.toLowerCase()
                    if(type == "quest") {
                        for(let i = 1; i<254; i++) {
                            if(ip == undefined || ip == "") {
                                body.style.cursor = "progress";
                                arp.getMAC(`192.168.1.${i}`, function(err, mac) {
                                    if(err) return;
                                    let a = oui(mac)
                                    try{
                                        if(a.split(' ')[0] == 'Oculus') {
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
                                body.style.cursor = "default";
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
            console.log('await ip')
        } else {
            console.log('ip found in json')
            check()
        }

        function names() {
            prompt({
                title: 'playername',
                label: 'Enter your oculus playername',
                value: '',
                type: 'input'
            })
            .then((r) => {
                if(r === null) {
                    console.log('user cancelled');
                    config.ip = ip
                    fs.writeFile(path.join(__dirname, `../config.json`), JSON.stringify(config), (err) => {
                        if (err) console.error;
                    });
                    reject(ip)
                } else {
                    pseudo = r;
                    config.pseudo = pseudo
                    config.ip = ip
                    fs.writeFile(path.join(__dirname, `../config.json`), JSON.stringify(config), (err) => {
                        if (err) console.error;
                    });
                    console.log('playername is ' + pseudo)
                    resolve({"ip":ip, "pseudo":pseudo});
                    
                }
            })
            .catch(console.error);
        }

        function check() {
            if(pseudo == undefined || pseudo == "") {
                names() 
                console.log('await playername')
            } else {
                console.log('playername found in json')
                config.ip = ip
                fs.writeFile(path.join(__dirname, `../config.json`), JSON.stringify(config), (err) => {
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