const tact = require('./tact')
const api = require('./api')
const ipFinder = require('./ipFinder')
const tactJs = require('./tact-js/tact-js.umd.js')
const config = require('../config.json')
const fs = require("fs");
const path = require("path");

class bhapticsPlayer {
    constructor(sendEvent) {
        this.sendEvent = sendEvent
        this.gameIpState = false
        this.hapticsConnectionState = false
        this.api = new api(tactJs.default.submitRegisteredWithScaleOption)
    }

    launch() {
        this.defineGameIp(config.ip)
        tact
            .onFileLoaded((file) => {
                this.sendEvent('tact-device-fileLoaded', file)
            })
            .onConnecting(() => {
                this.hapticsConnectionState = false
                this.sendEvent('tact-device-connecting', {})
            })
            .onConnected(() => {
                this.hapticsConnectionState = true
                this.sendEvent('tact-device-connected', {})
                this.startLoop()
            })
            .onDisconnected((message) => {
                this.hapticsConnectionState = false
                this.sendEvent('tact-device-disconnected', message.message) }
            )
            .connect()
    }

    defineGameIp(ip) {
        const definedIp = ip || config.ip
        this.validateIp(definedIp, () => {
            this.gameIpState && (config.ip = definedIp)
            this.gameIpState && this.sendEvent('game-ip-defined', definedIp)
            !this.gameIpState && this.sendEvent('game-ip-bad-defined', definedIp)
            this.gameIpState && this.api.setPlayerIp(definedIp, this.sendEvent)
            this.startLoop()
        })
    }

    save() {
        fs.writeFile(path.join(__dirname, `../config.json`), JSON.stringify(config), (err) => {
            if (err) {
                this.sendEvent('config-save-failed')
                return
            }
            this.sendEvent('config-save-success')
        });
    }

    startLoop() {
        if (false === this.isReady()) {
            setTimeout(() => {
                this.startLoop()
            }, 1000)
            return
        }

        this.api.request()
        this.startLoop()
    }

    isReady() {
        return this.hapticsConnectionState && this.gameIpState
    }

    validateIp(ip, callback) {
        ipFinder.validate(ip).then(() => {this.gameIpState = true}).catch(() => {this.gameIpState = false} ).finally(callback)
    }

    findIp(arg) {
        this.gameIpState = false
        ipFinder.findIp(arg)
            .then((ip)=> {
                this.defineGameIp(ip)
            }).catch((err) => {
                if(err === 'cancel') {
                    this.sendEvent('find-ip-canceled')
                } else if (err === 'timeout') {
                    this.sendEvent('find-ip-timeout')
                } else {
                    this.sendEvent('find-ip-failed', err)
                }
            })
    }
}

module.exports = bhapticsPlayer
