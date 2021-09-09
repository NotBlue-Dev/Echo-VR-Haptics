const api = require('./api')

class TactPlayer {
    constructor(tact, ipFinder, configLoader, sendEvent, listenEvent) {
        this.tact = tact
        this.ipFinder = ipFinder
        this.configLoader = configLoader
        this.sendEvent = sendEvent
        this.listenEvent = listenEvent
        this.gameIpState = false
        this.hapticsConnectionState = false
        this.logs = []
        this.api = new api(this.tact.playEffect, this.configLoader.load())
        this.initializeListeners()
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
        this.listenEvent('startRequest', this.startRequest.bind(this))
        this.listenEvent('stopRequest', this.stopRequest.bind(this))
    }

    launch() {
        this.defineGameIp(this.api.config.ip)
        
        this.tact
            .onFileLoaded((file) => {
                this.sendEvent('tact-device-fileLoaded', file)
            })
            .onConnecting(() => {
                this.sendEvent('tact-device-connecting', {})
            })
            .onConnected((name) => {
                //sinon start 4-5 fois la boucle et send l'event plusieurs fois
                if(this.hapticsConnectionState !== true) {
                    this.hapticsConnectionState = true
                    this.sendEvent('tact-device-connected', {
                        name:name
                    })
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
        this.configLoader.save(this.api.config, (err) => {
            if (err) {
                this.sendEvent('config-save-failed')
                return
            }
            this.sendEvent('config-save-success')
        })
    }

    startRequest() {
        if (this.isReady()) {
            this.api.state = true;
            this.api.request()
        }
    }

    stopRequest() {
        this.api.state = false;
    }

    isReady() {
        return this.hapticsConnectionState && this.gameIpState
    }

    validateIp(ip, callback) {
        this.ipFinder.validate(ip).then(() => {this.gameIpState = true}).catch(() => {this.gameIpState = false} ).finally(callback)
    }

    findIp(arg) {
        this.gameIpState = false
        this.ipFinder.findIp(arg)
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
        const defaultConfig = this.configLoader.loadDefault()
        this.api.setEffectsSetting(defaultConfig)
        this.getSettings()
    }

    getSettings() {
        this.sendEvent('settings-updated', this.api.config.effects)
    }
    
    playEffect(arg) {
        const names  = arg.effect
        this.tact.playEffect(names, this.api.config.effects[names])
    }

    getData() {
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

module.exports = TactPlayer
