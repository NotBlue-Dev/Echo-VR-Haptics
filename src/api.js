const fetch = require('node-fetch');
const fs = require("fs");
const path = require("path");
const Heart = require("./effects/heart");
const Stunned = require("./effects/stunned");
const Grab = require("./effects/grab");
const Goal = require("./effects/goal");
const Shield = require("./effects/shield");
const Stun = require("./effects/stun");
const GameData = require("./gameData");
const Wall = require("./effects/wall");
const Boost = require("./effects/boost");

let config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'))

let optHeart = {intensity: config.files[config.files.findIndex(x=>x.name === 'heart')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'heart')].dur}
let optStunned = {intensity: config.files[config.files.findIndex(x=>x.name === 'stunned')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'stunned')].dur}
let optGrab = {intensity: config.files[config.files.findIndex(x=>x.name === 'grab')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'grab')].dur}
let optGoal = {intensity: config.files[config.files.findIndex(x=>x.name === 'goal')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'goal')].dur}
let optShield = {intensity: config.files[config.files.findIndex(x=>x.name === 'shield')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'shield')].dur}
let optWall = {intensity: config.files[config.files.findIndex(x=>x.name === 'wall')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'wall')].dur}
let optBoost = {intensity: config.files[config.files.findIndex(x=>x.name === 'boost')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'boost')].dur}
let optStun = {intensity: config.files[config.files.findIndex(x=>x.name === 'stun')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'stun')].dur}

class Api {

    constructor(tactPlay, sendEvent, options) {
        this.tactPlay = tactPlay
        this.sendEvent = sendEvent

        this.effects = this.initializeEffects(options, this.tactPlay)
    }

    initializeEffects(options, tactPlay) {
        const effects = []
        options.heart && effects.push(new Heart(tactPlay, optHeart))
        options.stunned && effects.push(new Stunned(tactPlay, optStunned))
        options.grab && effects.push(new Grab(tactPlay, optGrab))
        options.goal && effects.push(new Goal(tactPlay, optGoal))
        options.shield && effects.push(new Shield(tactPlay, optShield))
        options.stun && effects.push(new Stun(tactPlay, optStun))
        options.boost && effects.push(new Boost(tactPlay, optBoost))
        options.wall && effects.push(new Wall(tactPlay, optWall))

        return effects;
    }

    setPlayerIp(ip) {
        this.playerIp = ip
    }

    playId() {
        fetch(`http://${this.playerIp}:6721/session`).then(resp => resp.json()).then(json => {
            const gameData = new GameData(json)
            if (false === gameData.isPlayerInGame()) {
                this.sendEvent('api-player-not-in-game')
            }
            this.playerTeamLength = gameData.playerTeamLength
        })
    }

    request() {
        fetch(`http://${this.playerIp}:6721/session`).then(resp => resp.json()).then(json => {
            const gameData = new GameData(json)

            if (false === gameData.isInMatch()) {
                this.request()
                return
            }

            if (false === gameData.isPlayerInGame()) {
                console.log(`Connected to ${this.playerIp}, Echo Arena API, logging ${this.playerName}`)
                this.playId()
                this.request()
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
