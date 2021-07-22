const ipFinder = require('./js/ipFinder.js')();
const bhaptic = require('./js/tact.js');
const tactJs = require('./js/tact-js/tact-js.umd.js');
const axios = require('axios');

let ip;
let pseudo;

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

ipFinder.then((obj)=> {
    ip = obj.ip;
    pseudo = obj.pseudo;
    request()
})

bhaptic().then((txt) => {
    if(txt != true) {
        console.log('Bhaptic player as an issue')
    } else {
        console.log('Connected to Bhaptic Player')
        
    }
})

function playId() {
    //on trouve le joueur dans le json retourner par l'api
    axios.get(`http://${ip}:6721/session`).then(resp => { 
        //team bleu
        let arr0 = resp.data.teams[0].players;

        if(arr0.some(item => item.name === pseudo)) {
            team = 0; 
            teamlen = arr0.length;
            index = arr0.findIndex((element, index) => {if (element.name === pseudo) {return true}})
        }
    
        //team orange
        let arr1 = resp.data.teams[1].players;
    
        if(arr1.some(item => item.name === pseudo)) {
            team = 1;
            teamlen = arr1.length
            index = arr1.findIndex((element, index) => {if (element.name === pseudo) {return true}})
        }
        
        playerid = resp.data.teams[team].players[index].playerid;
        stuns = resp.data.teams[team].players[index].stats.stuns
        orangepoints = resp.data.orange_points;
        bluepoints = resp.data.blue_points;
    })
    
    
}

function request() {
    axios.get(`http://${ip}:6721/session`).then(resp => { 
        if(team == undefined) {
            console.log(`Connected to ${ip}, Echo Arena API`)
            playId()
        } else {
            //player left ? on actu
            if(teamlen != resp.data.teams[team].players.length) playId()
            //refresh
            let player = resp.data.teams[team].players[index]
            
            //end game ?
            let clock = resp.data.game_clock_display.split('.')[0].replace(":", ".")
            clock = clock.replace(clock.charAt(0), '')
            let floatClock = +(clock)

            if (floatClock<0.30 && end == false && resp.data.game_status == "playing") {
                end = true;
                
                let heartBeat = setInterval(() => {
                    if(resp.data.game_status != "playing") clearInterval(heartBeat)
                    tactJs.default.submitRegistered('heart');
                },800);

                
                setTimeout(() => {
                    end = false;
                    clearInterval(heartBeat)
                }, 30000);
            }

            //stunned ? 

            if(player.stunned == true && stun == false) {
                stun = true;
                tactJs.default.submitRegistered('stunned');
                setTimeout(() => {
                    stun = false;
                }, 3000);
            } 

            //someone grab my back ? (dure 10ms donc tant que grab on submit)
            for(let i in resp.data.teams[0].players) {
                if((resp.data.teams[0].players[i].holding_right == playerid || resp.data.teams[0].players[i].holding_left == playerid) && resp.data.game_status == "playing") {
                    tactJs.default.submitRegistered('grab');
                }
            }
            for(let i in resp.data.teams[1].players) {
                if((resp.data.teams[1].players[i].holding_right == playerid || resp.data.teams[1].players[i].holding_left == playerid) && resp.data.game_status == "playing") {
                    tactJs.default.submitRegistered('grab');
                }
            }

            //point score ?

            if(orangepoints != resp.data.orange_points || bluepoints != resp.data.blue_points) {
                tactJs.default.submitRegistered('goal');
                bluepoints = resp.data.blue_points
                orangepoints = resp.data.orange_points    
            }

            //blocking ?
            if(player.blocking == true && block == false) {
                block = true;
                tactJs.default.submitRegistered('shield');
                setTimeout(() => {
                    block = false;
                }, 400);
            }

            //stun qlq ? (l'api met trop de tps a ajouter le stun au compteur donc y'a un gros décalage)

            // if(player.stats.stuns != stuns) {
            //     stuns = player.stats.stuns;
            //     tactJs.default.submitRegistered('stun');
            // }

            //ta manger un mur pélo ? (c pété faut réparer)
            
            let velocity = resp.data.teams[team].players[index].velocity
            let pyVeloc = Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2)+ Math.pow(velocity[2], 2);
            
            if((lastVel/2 > pyVeloc && lastVel > 24 && pyVeloc > 24) && (resp.data.teams[team].players[index].holding_left == "none")&&(resp.data.teams[team].players[index].holding_right == "none")) {
                tactJs.default.submitRegistered('mur');
            }
            lastVel = pyVeloc
        }
        request() //quand tout est finis on relance la requete (si on fais un interval ca flood le casque)
    }).catch(err =>{
        request()
        if(err.code != undefined) {
            console.log(`Error : ${err.code}`)
        } else {
            console.log(err)
        }
    })
}
