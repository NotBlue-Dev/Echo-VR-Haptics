const fetch = require('node-fetch');
const Heart = require("./effects/heart");
const Stunned = require("./effects/stunned");
const Grab = require("./effects/grab");
const Goal = require("./effects/goal");
const Shield = require("./effects/shield");
const Stun = require("./effects/stun");
const GameData = require("./gameData");
const Wall = require("./effects/wall");
const Boost = require("./effects/boost");

class Api {

    constructor(tactPlay, sendEvent, config) {
        this.tactPlay = tactPlay
        this.sendEvent = sendEvent
        this.config = config
        this.effects = []
        console.log(config)
        this.initializeEffects()
    }

    initializeEffects() {
        this.effects = []
        const effectClass = {
            heart: Heart,
            stunned: Stunned,
            grab: Grab,
            goal: Goal,
            shield: Shield,
            stun: Stun,
            boost: Boost,
            wall: Wall
        }

        for (const [name, effect] of Object.entries(this.config.effects)) {
            effect.enable && this.effects.push(new (effectClass[name])(this.tactPlay, {
                intensity: effect.intensity,
                duration: effect.duration
            }))
        }
    }

    setEffectsSetting(settings) {
        this.config.effects = settings

        this.initializeEffects()
    }

    setEffectSetting(name, options) {
        this.config.effects[name] = {
            ...this.config.effects[name],
            ...options
        }

        this.initializeEffects()
    }

    setPlayerIp(ip) {
        this.playerIp = ip
    }

    playId() {
        fetch(`http://${this.playerIp}:6721/session`).then(resp => resp.json()).then(json => {
            const gameData = new GameData(json)
            this.playerTeamLength = gameData.playerTeamLength
            
        })
    }

    request() {
        fetch(`http://${this.playerIp}:6721/session`).then(resp => resp.json()).then(json => {
            const gameData = new GameData(json)

            if (!gameData.isInMatch()) {
                console.log('not in match')
                return
            }

            if (this.playerTeamLength !== gameData.playerTeamLength) {
                this.playId()
            }

            this.effects.forEach((effect) => {
                effect.handle(gameData)
            })

            this.request() //restart request

        }).catch(error => {
            if (error.response) {
                if (error.response.status === 404) {
                    console.log('in Menu/Loading or invalid IP')
                } else {
                    console.log(error.response.status)
                }
            } else if (error.request) {
                console.log('Connection refused, game running ?');
            } else {
                console.log('Error', error);
            }
    
            //auto restart after 5s
            setTimeout(() => {
                this.playId()
                this.request()
            }, 5000);
        })
    }
}

module.exports = Api
