const tact = require('./tact')
const api = require('./api')
const ipFinder = require('./ipFinder')
const fs = require("fs");
const path = require("path");

class bhapticsPlayer {
    constructor(sendEvent, listenEvent) {
        this.sendEvent = sendEvent
        this.listenEvent = listenEvent
        this.gameIpState = false
        this.hapticsConnectionState = false
        this.playEffectFunction = tact.playEffect
        this.api = new api(this.playEffectFunction, this.sendEvent, this.loadConfig())
        this.logs = []
        this.initializeListeners()
    }

    loadConfig() {
        const defaultEffectConfigPath = path.join(__dirname, '../assets/default.json');
        const customConfigPath = path.join(__dirname, '../config.json');
        
        return {
            ip: null,
            effects: {
                ...this.loadJsonFile(defaultEffectConfigPath)
            },
            ...this.loadJsonFile(customConfigPath)
        }
    }
    
    loadJsonFile(filePath) {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath))
        }
        
        return {}
    }

    initializeListeners() {
        this.listenEvent('find-ip', this.findIp.bind(this))
        this.listenEvent('define-ip', this.defineGameIp.bind(this))
        this.listenEvent('save-config', this.save.bind(this))
        this.listenEvent('change-setting', this.updateSetting.bind(this))
        this.listenEvent('play-effect', this.playEffect.bind(this))
        this.listenEvent('default-settings', this.setDefaultSettings.bind(this))
        this.listenEvent('get-settings', this.getSettings.bind(this))
        this.listenEvent('get-data', this.getData.bind(this))
        this.listenEvent('log', this.addLog.bind(this))
    }

    launch() {
        this.defineGameIp(this.api.config.ip)
        
        tact
            .onFileLoaded((file) => {
                this.sendEvent('tact-device-fileLoaded', file)
            })
            .onConnecting(() => {
                this.sendEvent('tact-device-connecting', {})
            })
            .onConnected(() => {
                //sinon start 4-5 fois la boucle et send l'event plusieurs fois
                if(this.hapticsConnectionState !== true) {
                    this.hapticsConnectionState = true
                    this.sendEvent('tact-device-connected', {})
                    this.startRequest()
                }
            })
            .onDisconnected((message) => {
                this.hapticsConnectionState = false
                this.sendEvent('tact-device-disconnected', message.message) }
            )
            .connect()

    }

    defineGameIp(ip) {
        const definedIp = ip || this.api.config.ip
        this.validateIp(definedIp, () => {
            this.gameIpState && (this.api.config.ip = definedIp)
            this.gameIpState && this.sendEvent('game-ip-defined', definedIp)
            !this.gameIpState && this.sendEvent('game-ip-bad-defined', definedIp)
            this.gameIpState && this.api.setPlayerIp(definedIp, this.sendEvent)
            this.startRequest()
        })
    }

    save() {
        fs.writeFile(path.join(__dirname, `../config.json`), JSON.stringify(this.api.config), (err) => {
            if (err) {
                console.log('save failed')
                this.sendEvent('config-save-failed')
                return
            }
            console.log('save success')
            this.sendEvent('config-save-success')
        });
    }

    startRequest() {
        if (this.isReady()) {
            this.api.request()
        }
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

    updateSetting(arg) {
        const { effect } = arg

        const intensity = arg.intensity || this.api.config.effects[effect].intensity

        let enable = this.api.config.effects[effect].enable
        if (false === arg.enable || true === arg.enable) {
            enable = arg.enable
        }

        let val = parseFloat(intensity)
        val = Math.max(0.2, val)
        val = Math.min(5.0, val)
        this.api.setEffectSetting(effect, {
            intensity: val,
            enable
        })
    }

    setDefaultSettings() {
        this.api.setEffectsSetting(JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/default.json'), 'utf8')))
        this.getSettings()
    }

    getSettings() {
        this.sendEvent('settings-updated', this.api.config.effects)
    }

    playEffect(arg) {
        const { names } = arg
        this.playEffectFunction(names, this.api.config.effects[names])
    }

    getData() {
        console.log('get data')
        this.sendEvent('data-updated', {
            statusIp: this.api.config.ip,
            statusIpValid: this.gameIpState,
            statusHaptic: this.hapticsConnectionState,
            logs: this.logs,
        })
    }

    addLog(arg) {
        this.logs.push(arg)
    }
}

module.exports = bhapticsPlayer
