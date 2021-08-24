const tactJs = require('../../js/tact-js/tact-js.umd.js');
const axios = require('axios');

let team; 
let index;
let playerid;
let orangepoints;
let bluepoints;
let stun = false;
let stuns;
let teamlen;
let lastVel = 0;
let block = false;
let end = false;
let statuss;
let checks;

let optHeart = {intensity: config.files[config.files.findIndex(x=>x.name === 'heart')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'heart')].dur}
let optStunned = {intensity: config.files[config.files.findIndex(x=>x.name === 'stunned')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'stunned')].dur}
let optGrab = {intensity: config.files[config.files.findIndex(x=>x.name === 'grab')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'grab')].dur}
let optGoal = {intensity: config.files[config.files.findIndex(x=>x.name === 'goal')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'goal')].dur}
let optShield = {intensity: config.files[config.files.findIndex(x=>x.name === 'shield')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'shield')].dur}
let optWall = {intensity: config.files[config.files.findIndex(x=>x.name === 'wall')].intens, duration: config.files[config.files.findIndex(x=>x.name === 'wall')].dur}

function playId() {
    //get player in json
    axios.get(`http://${ip}:6721/session`).then(resp => { 
        //team bleu
        let arr0 = resp.data.teams[0].players;

        if(arr0 != undefined) {
            if(arr0.some(item => item.name === pseudo)) {
                team = 0; 
                teamlen = arr0.length;
                index = arr0.findIndex((element, index) => {if (element.name === pseudo) {return true}})
            }
        }

        //team orange
        let arr1 = resp.data.teams[1].players;

        if(arr1 != undefined) {
            if(arr1.some(item => item.name === pseudo)) {
                team = 1;
                teamlen = arr1.length
                index = arr1.findIndex((element, index) => {if (element.name === pseudo) {return true}})
            } else {
                if(team == undefined && index == undefined ) {
                    pause = true; 
                    let element = document.querySelector('#statusName')
                    element.style.color = '#FFBB00'
                    console.log('PSEUDO NOT IN GAME')
                    checks = false;
                }
            }
            
        }

        
        playerid = resp.data.teams[team].players[index].playerid;
        stuns = resp.data.teams[team].players[index].stats.stuns
        orangepoints = resp.data.orange_points;
        bluepoints = resp.data.blue_points;

        pause = false;
        
    })
}

function request() {
    
    axios.get(`http://${ip}:6721/session`).then(resp => { 

    if(team == undefined && (resp.data.match_type == 'Echo_Arena' || resp.data.match_type == 'Echo_Arena_Private') && pause == false) {
        console.log(`Connected to ${ip}, Echo Arena API, logging ${pseudo}`)
        playId()
    } else if ((resp.data.match_type == 'Echo_Arena' || resp.data.match_type == 'Echo_Arena_Private') && pause == false) {
        
        //player left ? on actu
        if(teamlen != resp.data.teams[team].players.length) playId()
        //refresh
        let player = resp.data.teams[team].players[index]
        //end game ? 
        statuss = resp.data.game_status;

        let clock = resp.data.game_clock_display.split('.')[0].replace(":", ".")
        clock = clock.replace(clock.charAt(0), '')
        let floatClock =+ (clock)
        if (floatClock<0.30 && end == false && resp.data.game_status == "playing" && options.heart == true) {
            console.log('heartbeat')
            end = true;
            
            let heartBeat = setInterval(() => {
                if(statuss != "playing") clearInterval(heartBeat), end = false;
                tactJs.default.submitRegisteredWithScaleOption('heart', optHeart);
            },800);
        }

        //stunned ? 

        if(player.stunned == true && stun == false && options.stunned == true) {
            stun = true;
            console.log('stun')
            tactJs.default.submitRegisteredWithScaleOption('stunned', optStunned)
            setTimeout(() => {
                stun = false;
            }, 3000);
        } 
        
        //someone grab my back ?
        for(let i in resp.data.teams[0].players) {
            if((resp.data.teams[0].players[i].holding_right == playerid || resp.data.teams[0].players[i].holding_left == playerid) && resp.data.game_status == "playing" && options.grab == true) {
                tactJs.default.submitRegisteredWithScaleOption('grab', optGrab);
            }
        }

        for(let i in resp.data.teams[1].players) {
            if((resp.data.teams[1].players[i].holding_right == playerid || resp.data.teams[1].players[i].holding_left == playerid) && resp.data.game_status == "playing" && options.grab == true) {
                tactJs.default.submitRegisteredWithScaleOption('grab', optGrab);
            }
        }
    

        //point score ?

        if((orangepoints != resp.data.orange_points || bluepoints != resp.data.blue_points) && options.goal == true) {
            tactJs.default.submitRegisteredWithScaleOption('goal', optGoal);
            bluepoints = resp.data.blue_points
            console.log('goal')
            orangepoints = resp.data.orange_points    
        }

        //blocking ?
        if(player.blocking == true && block == false && options.shield == true) {
            block = true;
            console.log('blocking')
            tactJs.default.submitRegisteredWithScaleOption('shield', optShield)
            setTimeout(() => {
                block = false;
            }, 400);
        }

        //stun smone ? #Broken#

        // if(player.stats.stuns != stuns && options.stun == true) {
        //     stuns = player.stats.stuns;
        //     tactJs.default.submitRegisteredWithScaleOption('stun');
        // }

        //hit a wall ?

        let velocity = resp.data.teams[team].players[index].velocity

        let pyVeloc = Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2)+ Math.pow(velocity[2], 2);

        if((lastVel/2 > pyVeloc && lastVel > 24 && pyVeloc > 24) && (resp.data.teams[team].players[index].holding_left == "none")&&(resp.data.teams[team].players[index].holding_right == "none") && options.wall == true) {
            tactJs.default.submitRegisteredWithScaleOption('wall', optWall);
            console.log('hit wall')
        } 
        lastVel = pyVeloc

        //Boost 6.56 24.95

    }

    request() //restart request

    }).catch(error =>{
        if(pause == false) {
            if (error.response) {
                if(error.response.status == 404) {
                    console.log('in Menu/Loading or invalid IP')
                    setTimeout(() => {
                        
                    }, );
                } else {
                    console.log(error.response.status)
                }
            } else if (error.request) {
                console.log('Connection refused, game running ?');
            } else {
                console.log('Error', error.message);
            }
        }

        //auto restart after 5s
        setTimeout(() => {
            playId()
            request()
        }, 5000);
    })
}