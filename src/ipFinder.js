const arp = require('arp')
const oui = require('oui')

class ipFinder {

    findIp(type) {
        console.log('findIp', typeof type)
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

            for(let i = 1; i < 5; i++) {
                for (let j = 1; j < 254; j++) {
                    this.validate(`192.168.${i}.${j}`).then(() => {
                        resolve(`192.168.${i}.${j}`)
                    }).catch(() => {})
                }
            }

            reject('failed')
        })
    }

    validate(ip) {
        return new Promise((resolve, reject) => {
            arp.getMAC(ip, (err, mac) => {
                if (err) {
                    reject()
                    return
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

module.exports = new ipFinder()
