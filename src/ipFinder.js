const arp = require('arp')
const oui = require('oui')
const find = require('local-devices');

class IpFinder {

    findIp(type) {
        return new Promise((resolve, reject) => {
            if(type === '') {
                reject('cancel')
                return
            }

            const normalizedType = type.toLowerCase()
            if(normalizedType !== 'quest') {
                resolve('localhost')
                return;
            }

            setTimeout(() => {
                reject('timeout')
            }, 10000)

            find().then(devices => {
                devices.forEach(data => {
                    this.validate(data.ip).then(() => {
                        resolve(data.ip)
                    }).catch(() => {})
                });
            })                   
        })
    }

    validate(ip) {
        return new Promise((resolve, reject) => {
            if(ip === 'localhost') resolve()
            arp.getMAC(ip, (err, mac) => {
                if (err) {
                    reject()
                    return;
                }
                try {
                    let a = oui(mac)
                    if (a.split(' ')[0] === 'Oculus') {
                        resolve()
                    }
                } catch {
                    reject()
                }
            })
        })
    }
}

module.exports = IpFinder
