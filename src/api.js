const fetch = require('node-fetch');
const fs = require("fs");
const path = require("path");

let end = false;
let statuss;
let tempVeloc;
let tempVelocMax = 24.95
let pyVeloc;
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

        this.playerIp = null
        this.playerId = null
        this.playerIndex = null
        this.playerName = null
        this.playerTeamIndex = null

        this.boost1 = false
        this.boost2 = false
        this.stun = false
        this.stunned = false
        this.lastVel = 0
        this.block = false
        this.options = options
    }

    setPlayerIp(ip) {
        this.playerIp = ip
    }

    playId() {
    //get player in json
    fetch(`http://${this.playerIp}:6721/session`).then(resp => resp.json()).then(json => {
        //team bleu
        const blueTeamPlayers = json.data.teams[0].players;
        this.playerName = json.data.client_name;
        const orangeTeamPlayers = json.data.teams[1].players;

        if (blueTeamPlayers === undefined && orangeTeamPlayers === undefined) {
            return
        }

        if(blueTeamPlayers !== undefined && blueTeamPlayers.some(item => item.name === this.playerName)) {
            this.playerTeamIndex = 0;
            this.playerTeamLength = blueTeamPlayers.length;
            this.playerIndex = blueTeamPlayers.findIndex((element) => { return (element.name === this.playerName)})
        } else if(orangeTeamPlayers !== undefined && orangeTeamPlayers.some(item => item.name === this.playerName)) {
            this.playerTeamIndex = 1;
            this.playerTeamLength = orangeTeamPlayers.length
            this.playerIndex = orangeTeamPlayers.findIndex((element) => { return (element.name === this.playerName)})
        } else if (this.playerTeamIndex === null && this.playerIndex == null ) {
            this.sendEvent('api-player-not-in-game')
            // pause = true;
            // let element = document.querySelector('#statusName')
            // element.style.color = '#FFBB00'
            // console.log('PSEUDO NOT IN GAME')
        }

        this.playerId = json.data.teams[this.playerTeamIndex].players[this.playerIndex].playerid;
        this.orangepoints = json.data.orange_points;
        this.bluepoints = json.data.blue_points;

        pause = false;
    })
}

    request() {

        fetch(`http://${this.playerIp}:6721/session`).then(resp => resp.json()).then(json => {

            const matchType = json.data.match_type
            if (matchType !== 'Echo_Arena' && matchType !== 'Echo_Arena_Private') {
                this.request()
                return
            }

            if (this.playerTeamIndex === null) {
                console.log(`Connected to ${this.playerIp}, Echo Arena API, logging ${this.playerName}`)
                this.playId()
                this.request()
                return
            }


            const playerTeam = json.data.teams[this.playerTeamIndex]
            //player left ? on actu
            this.refresh(playerTeam)

            //refresh
            let player = playerTeam.players[this.playerIndex]
            //end game ?
            statuss = json.data.game_status;

            let clock = json.data.game_clock_display.split('.')[0].replace(":", ".")
            clock = clock.replace(clock.charAt(0), '')
            let floatClock = +(clock)
            if (floatClock < 0.30 && end == false && json.data.game_status == "playing" && this.options.heart == true) {
                console.log('heartbeat')
                end = true;

                let heartBeat = setInterval(() => {
                    if (statuss != "playing") clearInterval(heartBeat), end = false;
                    this.tactPlay('heart', optHeart);
                }, 800);
            }

            this.handleStunned(player)
            this.handleGrab(json.data.teams[0].players, json.data.teams[1].players, json.data.game_status)
            this.handleGoal(json.data.blue_points, json.data.orange_points)
            this.handleBlock(player)
            this.handleStun(player, json.data.teams[Math.abs(this.playerTeamIndex - 1)].players)
            this.handleWall(player)
            this.handleBoost(player)

            this.request() //restart request

        }).catch(error => {
            if (error.response) {
                if (error.jsononse.status == 404) {
                    console.log('in Menu/Loading or invalid IP')
                } else {
                    console.log(error.jsononse.status)
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

    refresh(team) {
        if (this.playerTeamLength !== team.players.length) {
            this.playId()
        }
    }

    handleStunned(player) {
        if (player.stunned == true && this.stunned == false && this.options.stunned == true) {
            this.stunned = true;
            console.log('stunned')
            this.tactPlay('stunned', optStunned)
            setTimeout(() => {
                this.stunned = false;
            }, 3000);
        }
    }

    handleGrab(orangePlayers, bluePlayers, gameStatus) {
        for (let i in orangePlayers) {
            if ((orangePlayers[i].holding_right === this.playerId || orangePlayers[i].holding_left === this.playerId) && gameStatus === "playing" && this.options.grab === true) {
                this.tactPlay('grab', optGrab);
            }
        }

        for (let i in bluePlayers) {
            if ((bluePlayers[i].holding_right === this.playerId || bluePlayers[i].holding_left === this.playerId) && gameStatus === "playing" && this.options.grab === true) {
                this.tactPlay('grab', optGrab);
            }
        }
    }

    handleGoal(bluePoints, orangePoints) {
        if ((this.orangepoints != orangePoints || this.bluepoints != bluePoints) && this.options.goal == true) {
            console.log('goal')
            this.tactPlay('goal', optGoal);
            this.bluepoints = bluePoints
            this.orangepoints = orangePoints
        }
    }

    handleBlock(player) {
        if (player.blocking == true && this.block == false && this.options.shield == true) {
            this.block = true;
            console.log('blocking')
            this.tactPlay('shield', optShield)
            setTimeout(() => {
                this.block = false;
            }, 400);
        }
    }

    handleStun(player, enemyPlayers) {
        // FIXME: Broken

        if (this.options.stun == true && this.stun == false) {
            const playerPos = player.head.position
            for (let i in enemyPlayers) {
                const enemyPos = enemyPlayers[i].head.position
                if ((playerPos[0] >= enemyPos[0] - 1 && playerPos[0] <= enemyPos[0] + 1)
                    && (playerPos[1] >= enemyPos[1] - 1 && playerPos[1] <= enemyPos[1] + 1)
                    && (playerPos[2] >= enemyPos[2] - 1 && playerPos[2] <= enemyPos[2] + 1)) {
                    if (enemyPlayers[i].stunned) {
                        console.log('STUN')
                        this.stun = true;
                        this.tactPlay('stun', optStun);
                        setTimeout(() => {
                            this.stun = false;
                        }, 1000);
                    }
                }
            }
        }
    }

    handleBoost(player) {
        let velocity = player.velocity

        pyVeloc = Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2) + Math.pow(velocity[2], 2);

        //Boost 6.56 24.95

        if (tempVeloc > 25) tempVeloc = 24.94
        if (tempVelocMax > 25) tempVeloc = 24.94

        if (!(pyVeloc >= 24.94) && (pyVeloc >= tempVeloc - 0.12 && pyVeloc <= tempVeloc + 0.12) && this.boost1 === false) {
            this.boost1 = true;
            this.tactPlay('boost', optBoost);
            setTimeout(() => {
                this.boost1 = false;
            }, 1000);
        }

        if ((pyVeloc >= tempVelocMax - 0.12 && pyVeloc <= tempVelocMax + 0.12) && this.boost2 === false) {
            this.boost2 = true;
            this.tactPlay('boost', optBoost);

        }

        if (pyVeloc < 24.94) {
            this.boost2 = false;
        }
    }

    handleWall(player) {
        const velocity = player.velocity

        const pyVeloc = Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2) + Math.pow(velocity[2], 2);

        if ((this.lastVel / 2 > pyVeloc && this.lastVel > 24 && pyVeloc > 24)
            && (player.holding_left === "none")
            && (player.holding_right === "none")
            && this.options.wall === true) {
            this.tactPlay('wall', optWall);
            console.log('hit wall')
        }
        this.lastVel = pyVeloc
    }
}

setInterval(() => {
    tempVeloc = pyVeloc + 6.56
}, 50)

module.exports = Api
