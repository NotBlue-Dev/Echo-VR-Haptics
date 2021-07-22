//module

import axios from 'axios';
//bhaptics
import tactJs from './tact-js/dist/tact-js.umd.js';
import prompt from 'prompt';
import arp from 'arp';
import oui from 'oui';
import fs from 'fs';

let ip;
let type;
let pseudo;

//script pour scan network et trouver le quest
fs.readFile('./config.json', 'utf8', function(err, data){
    if(data.length == 0) {

        prompt.start();

        prompt.get(['Quest or PC'], function (err, result) {
            if (err) { return onErr(err); }
            type = Object.values(result)[0].toLowerCase()
            
            if(type == "quest") {
                for(let i = 1; i<254; i++) {
                    if(ip == undefined) {
                        arp.getMAC(`192.168.1.${i}`, function(err, mac) {
                            if(err) return;
                            let a = oui(mac)
                            try{
                                if(a.split(' ')[0] == 'Oculus') {
                                    ip = `192.168.1.${i}`
                                }
                            } catch {}
                        });
                    }
                }
            } else {
                ip = 'localhost'
            }
            prompt.get(['pseudo'], function (err, result) {
                pseudo = Object.values(result)[0]
                let obj = {"ip":ip, "pseudo":pseudo}
                fs.writeFileSync('../../config.json', JSON.stringify(obj));
                haptic()

            })
        });
    } else {
        data = JSON.parse(data)
        ip = data.ip
        pseudo = data.pseudo
        haptic()

    }
});



//Analyse données vers haptique start

function haptic() {

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

    function request() {
        axios.get(`http://${ip}:6721/session`).then(resp => { 
                
            //on trouve le joueur dans le json
            function playId() {
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
            }
            if(team == undefined) {
                playId()
            } else {
                //player left ?
                
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
                    console.log('DANS TA GEULE LE MUR', lastVel, pyVeloc)
                }
                lastVel = pyVeloc
            }
            request() //quand tout est finis on relance la requete (si on fais un interval ca flood le casque)
        }).catch(err =>{
            request()
        })
    }

    //first start
    request()

    //Bhaptics part
    let connect = false;
    
    //try catch car la lib bhaptic catch pas si le player est pas allumer et ca fais tout crash
    try {
        tactJs.default.addListener(function(msg) {
            if (msg.status === 'Connected' && connect == false) {
            console.log('connected');
            connect = true;
            tactJs.default.registerFile('goal', '{"project":{"createdAt":1626000815149,"description":"","layout":{"layouts":{"VestBack":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}],"VestFront":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}]},"name":"Tactot","type":"Tactot"},"mediaFileDuration":3,"name":"Echo VR","tracks":[{"effects":[{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":338,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":338,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.7,"time":0,"x":0.89,"y":0.27},{"intensity":0.7,"time":61,"x":0.98,"y":0.46},{"intensity":0.7,"time":123,"x":0.84,"y":0.62},{"intensity":0.7,"time":185,"x":0.69,"y":0.47},{"intensity":0.7,"time":242,"x":0.73,"y":0.28},{"intensity":0.7,"time":338,"x":0.5,"y":0.5}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.7,"time":0,"x":0.07,"y":0.69},{"intensity":0.7,"time":53,"x":0,"y":0.51},{"intensity":0.7,"time":122,"x":0.14,"y":0.3},{"intensity":0.7,"time":184,"x":0.29,"y":0.47},{"intensity":0.7,"time":248,"x":0.25,"y":0.7},{"intensity":0.7,"time":338,"x":0.5,"y":0.5}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.7,"time":0,"x":0.35,"y":0.05},{"intensity":0.7,"time":56,"x":0.55,"y":0},{"intensity":0.7,"time":122,"x":0.73,"y":0.16},{"intensity":0.7,"time":194,"x":0.53,"y":0.33},{"intensity":0.7,"time":254,"x":0.32,"y":0.26},{"intensity":0.7,"time":338,"x":0.5,"y":0.5}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.7,"time":0,"x":0.73,"y":0.89},{"intensity":0.7,"time":75,"x":0.48,"y":0.98},{"intensity":0.7,"time":137,"x":0.33,"y":0.82},{"intensity":0.7,"time":195,"x":0.48,"y":0.68},{"intensity":0.7,"time":255,"x":0.69,"y":0.71},{"intensity":0.7,"time":338,"x":0.5,"y":0.49}],"visible":true}]}}},"name":"Effect 2","offsetTime":338,"startTime":0}],"enable":true},{"enable":true,"effects":[]}],"updatedAt":1626615758344},"durationMillis":0,"intervalMillis":20,"size":20}');
            tactJs.default.registerFile('mur', '{"project":{"createdAt":1626000815149,"description":"","layout":{"layouts":{"VestBack":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}],"VestFront":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}]},"name":"Tactot","type":"Tactot"},"mediaFileDuration":3,"name":"Echo VR","tracks":[{"effects":[{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":650,"playbackType":"FADE_OUT","pointList":[{"index":0,"intensity":0.6},{"index":1,"intensity":0.6},{"index":19,"intensity":0.6},{"index":18,"intensity":0.6},{"index":17,"intensity":0.6},{"index":16,"intensity":0.6},{"index":8,"intensity":0.6},{"index":12,"intensity":0.6},{"index":4,"intensity":0.6},{"index":5,"intensity":0.6},{"index":9,"intensity":0.6},{"index":13,"intensity":0.6},{"index":14,"intensity":0.6},{"index":10,"intensity":0.6},{"index":6,"intensity":0.6},{"index":2,"intensity":0.6},{"index":3,"intensity":0.6},{"index":7,"intensity":0.6},{"index":11,"intensity":0.6},{"index":15,"intensity":0.6}],"startTime":0}]},"mode":"DOT_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":650,"playbackType":"FADE_OUT","pointList":[{"index":0,"intensity":1},{"index":1,"intensity":1},{"index":2,"intensity":1},{"index":3,"intensity":1},{"index":7,"intensity":1},{"index":6,"intensity":1},{"index":5,"intensity":1},{"index":4,"intensity":1},{"index":8,"intensity":1},{"index":9,"intensity":1},{"index":10,"intensity":1},{"index":11,"intensity":1},{"index":15,"intensity":1},{"index":14,"intensity":1},{"index":13,"intensity":1},{"index":16,"intensity":1},{"index":12,"intensity":1},{"index":17,"intensity":1},{"index":19,"intensity":1},{"index":18,"intensity":1}],"startTime":0}]},"mode":"DOT_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}}},"name":"Effect 1","offsetTime":650,"startTime":0}],"enable":true},{"enable":true,"effects":[]}],"updatedAt":1626616007910},"durationMillis":0,"intervalMillis":20,"size":20}');
            tactJs.default.registerFile('grab', '{"project":{"createdAt":1626000815149,"description":"","layout":{"layouts":{"VestBack":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}],"VestFront":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}]},"name":"Tactot","type":"Tactot"},"mediaFileDuration":3,"name":"Echo VR","tracks":[{"effects":[{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":20,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":20,"playbackType":"NONE","pointList":[{"index":3,"intensity":0.5},{"index":2,"intensity":0.5},{"index":7,"intensity":0.5},{"index":1,"intensity":0.5},{"index":0,"intensity":0.5},{"index":4,"intensity":0.5}],"startTime":0}]},"mode":"DOT_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":0.5,"time":0,"x":1,"y":0}],"visible":true}]}}},"name":"Effect 1","offsetTime":20,"startTime":0}],"enable":true},{"enable":true,"effects":[]}],"updatedAt":1626615641881},"durationMillis":0,"intervalMillis":20,"size":20}')
            tactJs.default.registerFile('shield', '{"project":{"createdAt":1626000815149,"description":"","layout":{"layouts":{"VestBack":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}],"VestFront":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}]},"name":"Tactot","type":"Tactot"},"mediaFileDuration":3,"name":"Echo VR","tracks":[{"effects":[{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":240,"playbackType":"FADE_OUT","pointList":[{"index":9,"intensity":0.3},{"index":5,"intensity":0.3},{"index":6,"intensity":0.3},{"index":10,"intensity":0.3}],"startTime":0}]},"mode":"DOT_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":240,"playbackType":"FADE_OUT","pointList":[{"index":5,"intensity":1},{"index":9,"intensity":1},{"index":10,"intensity":1},{"index":6,"intensity":1}],"startTime":0}]},"mode":"DOT_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}}},"name":"Effect 1tet","offsetTime":240,"startTime":0}],"enable":true},{"enable":true,"effects":[]}],"updatedAt":1626712614613},"durationMillis":0,"intervalMillis":20,"size":20}');
            tactJs.default.registerFile('stun', '{"project":{"createdAt":1626000815149,"description":"","layout":{"layouts":{"VestBack":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}],"VestFront":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}]},"name":"Tactot","type":"Tactot"},"mediaFileDuration":3,"name":"Echo VR","tracks":[{"effects":[{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":1000,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"DOT_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}},"VestFront":{"dotMode":{"dotConnected":true,"feedback":[{"endTime":200,"playbackType":"NONE","pointList":[{"index":0,"intensity":1},{"index":2,"intensity":1},{"index":7,"intensity":1}],"startTime":0},{"endTime":400,"playbackType":"NONE","pointList":[{"index":8,"intensity":1},{"index":9,"intensity":1},{"index":6,"intensity":1},{"index":18,"intensity":1},{"index":15,"intensity":1}],"startTime":200},{"endTime":600,"playbackType":"NONE","pointList":[{"index":17,"intensity":1},{"index":11,"intensity":1},{"index":2,"intensity":1},{"index":4,"intensity":1}],"startTime":400},{"endTime":800,"playbackType":"NONE","pointList":[{"index":9,"intensity":1},{"index":2,"intensity":1},{"index":12,"intensity":1},{"index":19,"intensity":1}],"startTime":600},{"endTime":1000,"playbackType":"NONE","pointList":[{"index":0,"intensity":1},{"index":19,"intensity":1},{"index":7,"intensity":1},{"index":14,"intensity":1}],"startTime":800},{"endTime":1000,"playbackType":"NONE","pointList":[{"index":2,"intensity":1},{"index":12,"intensity":1},{"index":15,"intensity":1},{"index":4,"intensity":1},{"index":10,"intensity":1}],"startTime":1000}]},"mode":"DOT_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}}},"name":"dot","offsetTime":1000,"startTime":0},{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":559,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.9,"time":0,"x":0.47,"y":0.72},{"intensity":0.9,"time":559,"x":1,"y":0.28}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.9,"time":0,"x":0.45,"y":0.72},{"intensity":0.9,"time":559,"x":0,"y":0.25}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.9,"time":0,"x":0.25,"y":0.98},{"intensity":0.9,"time":559,"x":0,"y":0}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.9,"time":0,"x":0.67,"y":0.98},{"intensity":0.9,"time":559,"x":1,"y":0}],"visible":true}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":559,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.9,"time":0,"x":0.47,"y":0.72},{"intensity":0.9,"time":559,"x":1,"y":0.28}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.9,"time":0,"x":0.45,"y":0.72},{"intensity":0.9,"time":559,"x":0,"y":0.25}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.9,"time":0,"x":0.25,"y":0.98},{"intensity":0.9,"time":559,"x":0,"y":0}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.9,"time":0,"x":0.67,"y":0.98},{"intensity":0.9,"time":559,"x":1,"y":0}],"visible":true}]}}},"name":"path","offsetTime":559,"startTime":0}],"enable":true},{"effects":[{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":296,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.5,"time":0,"x":0.48,"y":1},{"intensity":0.5,"time":296,"x":0.5,"y":0}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.5,"time":0,"x":0.67,"y":1},{"intensity":0.5,"time":296,"x":1,"y":0.5}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.5,"time":0,"x":0.48,"y":1},{"intensity":0.5,"time":296,"x":0.51,"y":0.48}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.5,"time":0,"x":0.3,"y":1},{"intensity":0.5,"time":296,"x":0,"y":0.49}],"visible":true}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":296,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.5,"time":0,"x":0.48,"y":1},{"intensity":0.5,"time":296,"x":0.5,"y":0}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.5,"time":0,"x":0.67,"y":1},{"intensity":0.5,"time":296,"x":1,"y":0.5}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.5,"time":0,"x":0.48,"y":1},{"intensity":0.5,"time":296,"x":0.51,"y":0.48}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"FADE_OUT","pointList":[{"intensity":0.5,"time":0,"x":0.3,"y":1},{"intensity":0.5,"time":296,"x":0,"y":0.49}],"visible":true}]}}},"name":"Effect 1","offsetTime":296,"startTime":0}],"enable":true}],"updatedAt":1626615905917},"durationMillis":0,"intervalMillis":20,"size":20}');
            tactJs.default.registerFile('stunned', '{"project":{"createdAt":1626000815149,"description":"","layout":{"layouts":{"VestBack":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}],"VestFront":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}]},"name":"Tactot","type":"Tactot"},"mediaFileDuration":3,"name":"Echo VR","tracks":[{"effects":[{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":212,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":212,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":1,"time":0,"x":1,"y":1},{"intensity":1,"time":212,"x":0,"y":0.749}],"visible":true}]}}},"name":"path","offsetTime":212,"startTime":0},{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":205,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":1,"time":0,"x":0,"y":0.751},{"intensity":1,"time":205,"x":1,"y":0.502}],"visible":true}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":205,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}}},"name":"path","offsetTime":205,"startTime":160},{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":201,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":201,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":1,"time":0,"x":1,"y":0.5},{"intensity":1,"time":201,"x":0,"y":0.745}],"visible":true}]}}},"name":"path","offsetTime":201,"startTime":307},{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":217,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":1,"time":0,"x":0,"y":0.253},{"intensity":1,"time":217,"x":1,"y":0}],"visible":true}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":217,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}}},"name":"path","offsetTime":217,"startTime":451},{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":458,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":0.9,"time":0,"x":0,"y":1},{"intensity":0.9,"time":458,"x":0,"y":0}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":0.9,"time":0,"x":0.34,"y":1},{"intensity":0.9,"time":458,"x":0.33,"y":0}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":0.9,"time":0,"x":0.67,"y":1},{"intensity":0.9,"time":458,"x":0.65,"y":0}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":0.9,"time":0,"x":1,"y":0.99},{"intensity":0.9,"time":458,"x":1,"y":0}],"visible":true}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":458,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":0.9,"time":0,"x":0,"y":0},{"intensity":0.9,"time":458,"x":0,"y":1}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":0.9,"time":0,"x":0.34,"y":0},{"intensity":0.9,"time":458,"x":0.33,"y":1}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":0.9,"time":0,"x":0.67,"y":0},{"intensity":0.9,"time":458,"x":0.65,"y":1}],"visible":true},{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":0.9,"time":0,"x":1,"y":0.010000000000000009},{"intensity":0.9,"time":458,"x":1,"y":1}],"visible":true}]}}},"name":"Effect 1","offsetTime":458,"startTime":0}],"enable":true},{"effects":[{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":213,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":213,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":1,"time":0,"x":0,"y":1},{"intensity":1,"time":213,"x":1,"y":0.751}],"visible":true}]}}},"name":"path","offsetTime":213,"startTime":0},{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":210,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":1,"time":0,"x":1,"y":0.753},{"intensity":1,"time":210,"x":0,"y":0.502}],"visible":true}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":210,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}}},"name":"path","offsetTime":210,"startTime":159},{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":201,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":201,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":1,"time":0,"x":0,"y":0.502},{"intensity":1,"time":201,"x":1,"y":0.756}],"visible":true}]}}},"name":"path","offsetTime":201,"startTime":307},{"modes":{"VestBack":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":213,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","pointList":[{"intensity":1,"time":0,"x":1,"y":0.246},{"intensity":1,"time":213,"x":0,"y":0}],"visible":true}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":213,"playbackType":"NONE","startTime":0,"pointList":[]}]},"mode":"PATH_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}}},"name":"path","offsetTime":213,"startTime":451}],"enable":true}],"updatedAt":1626615523451},"durationMillis":0,"intervalMillis":20,"size":20}')
            tactJs.default.registerFile('heart', '{"project":{"createdAt":1626000815149,"description":"","layout":{"layouts":{"VestBack":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}],"VestFront":[{"index":0,"x":0,"y":0},{"index":1,"x":0.333,"y":0},{"index":2,"x":0.667,"y":0},{"index":3,"x":1,"y":0},{"index":4,"x":0,"y":0.25},{"index":5,"x":0.333,"y":0.25},{"index":6,"x":0.667,"y":0.25},{"index":7,"x":1,"y":0.25},{"index":8,"x":0,"y":0.5},{"index":9,"x":0.333,"y":0.5},{"index":10,"x":0.667,"y":0.5},{"index":11,"x":1,"y":0.5},{"index":12,"x":0,"y":0.75},{"index":13,"x":0.333,"y":0.75},{"index":14,"x":0.667,"y":0.75},{"index":15,"x":1,"y":0.75},{"index":16,"x":0,"y":1},{"index":17,"x":0.333,"y":1},{"index":18,"x":0.667,"y":1},{"index":19,"x":1,"y":1}]},"name":"Tactot","type":"Tactot"},"mediaFileDuration":3,"name":"Echo VR","tracks":[{"effects":[{"modes":{"VestBack":{"dotMode":{"dotConnected":true,"feedback":[]},"mode":"DOT_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":88,"playbackType":"NONE","startTime":0,"pointList":[]},{"endTime":176,"playbackType":"NONE","pointList":[{"index":1,"intensity":0.4},{"index":5,"intensity":0.4},{"index":0,"intensity":0.4}],"startTime":88},{"endTime":265,"playbackType":"NONE","startTime":176,"pointList":[]}]},"mode":"DOT_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}}},"name":"dot","offsetTime":265,"startTime":0}],"enable":true},{"effects":[{"modes":{"VestBack":{"dotMode":{"dotConnected":true,"feedback":[]},"mode":"DOT_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}},"VestFront":{"dotMode":{"dotConnected":false,"feedback":[{"endTime":82,"playbackType":"NONE","startTime":0,"pointList":[]},{"endTime":164,"playbackType":"NONE","pointList":[{"index":1,"intensity":0.4},{"index":5,"intensity":0.4}],"startTime":82},{"endTime":246,"playbackType":"NONE","startTime":164,"pointList":[]}]},"mode":"DOT_MODE","pathMode":{"feedback":[{"movingPattern":"CONST_SPEED","playbackType":"NONE","visible":true,"pointList":[]}]}}},"name":"dot","offsetTime":246,"startTime":189}],"enable":true}],"updatedAt":1626775319103},"durationMillis":0,"intervalMillis":20,"size":20}')
        }
        });
    
        //effet de ping pour le gilet 
        tactJs.default.registerFile('ping', '{"ping":"pong"}');
    } catch {
        console.log('Bhaptic player is not running')
    }
}
