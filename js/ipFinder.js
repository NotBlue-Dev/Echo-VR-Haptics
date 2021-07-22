const prompt = require('prompt')
const arp = require('arp')
const oui = require('oui')
const fs = require('fs')

let ip;
let type;
let pseudo;

function find() {
    return new Promise((resolve, reject) => {
        fs.readFile('./config.json', 'utf8', function(err, data) {
            if(data.length ==2) {
                
                prompt.start();
                
                prompt.get(['Quest or PC'], function (err, result) {
                    if (err) { return onErr(err); }
                    type = Object.values(result)[0].toLowerCase()
                    
                    if(type == "quest") {
                        for(let i = 1; i<254; i++) {
                            if(ip == undefined) {
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
                            if(ip == undefined) {
                                console.log('Cant find quest IP, enter manually in config.json, auto exit in 5s') 
                                setTimeout(() => {
                                    process.exit(1)
                                }, 5000);
                            } else {
                                console.log('Quest found ! ' + ip)
                                names()
                            }
                            
                        }, 10000);
                        
                    } else {
                        ip = 'localhost'
                    }
                    
                    if(type != 'quest' && type != undefined) names()
        
                    function names() {
                        prompt.get(['pseudo'], function (err, result) {
                            pseudo = Object.values(result)[0]
                            let obj = {"ip":ip, "pseudo":pseudo}
                            fs.writeFileSync('./config.json', JSON.stringify(obj));
                            resolve({"ip":ip, "pseudo":pseudo});
                        })
                    }
                    
                });

            } else {
                data = JSON.parse(data)
                ip = data.ip
                pseudo = data.pseudo
                resolve({"ip":ip, "pseudo":pseudo});
            }
        }); 
    });
}

module.exports = function() {

    return find()

}