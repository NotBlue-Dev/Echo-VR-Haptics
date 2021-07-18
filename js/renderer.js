
const axios = require('axios');
const path = require('path')

import * as THREE from './threejs/r130/build/three.module.js';
import {OBJLoader} from './threejs/r130/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from './threejs/r130/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './threejs/r130/examples/jsm/controls/OrbitControls.js';
import tactJs from './tact-js/dist/tact-js.es5.js'

//let ip = '192.168.1.53'
let ip = 'localhost'

//On crée la scene et le renderer/objet
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const light = new THREE.AmbientLight( 0x404040, 1 );
let lights = new THREE.DirectionalLight(0x404040, 4); // soft white light
scene.add( light );
scene.add( lights );

let rotationMatrixOrange = new THREE.Matrix4();
let rotationMatrixBlue = new THREE.Matrix4();

const controls = new OrbitControls( camera, renderer.domElement );

//debug arene

// let geometry = new THREE.BoxGeometry();
// let material = new THREE.MeshBasicMaterial({color: 0xfffff, wireframe: true});

// let cube1 = new THREE.Mesh(geometry, material);
// cube1.position.set(0,0,40)
// let cube2 = new THREE.Mesh(geometry, material);
// cube2.position.set(0,0,-40)
// let cube3 = new THREE.Mesh(geometry, material);
// cube3.position.set(15,0,0)
// let cube4 = new THREE.Mesh(geometry, material);
// cube4.position.set(-15,0,0)
// let cube5 = new THREE.Mesh(geometry, material);
// cube5.position.set(0,10,0)
// let cube6 = new THREE.Mesh(geometry, material);
// cube6.position.set(0,-10,0)

// scene.add(cube1);
// scene.add(cube2);
// scene.add(cube3);
// scene.add(cube4);
// scene.add(cube5);
// scene.add(cube6);

camera.position.z = 1;

controls.update();

let player;
let playerL;
let playerR;

const loaders = new GLTFLoader();

//Detection collision Start (threejs)

function getInfo() {
    //init + inc a coter car on peut pas recuperer i dans le load

    loaders.load('model/disk.glb', (gltf) => {
        const root = gltf.scene;
        root.name = "disk"
        scene.add(root);
    });
    
    loaders.load('model/arena.glb', (gltf) => {
        const root = gltf.scene;
        scene.add(root);
        root.name = "world"
        let axesHelper = new THREE.AxesHelper( 5 );
        root.add(axesHelper)
        root.rotation.y = 1.57;
        root.position.x = 0.3;
        root.position.y = -2.1;
        root.scale.set(1,0.9,1);
        scene.add(root);
    });

    let z = 0
    for (var i = 0; i <= 7; i++) {
        loaders.load('model/body.glb', (gltf) => {
            const root = gltf.scene;
            root.name = "cube"+z
            z++
            let axesHelper = new THREE.AxesHelper( 5 );
            root.add(axesHelper)
            scene.add(root);
        });

    }

    let x = 0
    for (var i = 0; i <= 7; i++) {
        loaders.load('model/gauche.glb', (gltf) => {
            const root = gltf.scene;
            root.name = "handL"+x
            x++
            scene.add(root);
        });
    }

    let a = 0
    for (var i = 0; i <= 7; i++) {
        loaders.load('model/droite.glb', (gltf) => {
            const root = gltf.scene;
            root.name = "handR"+a
            a++
            scene.add(root);
        });
    }
    animate();
}

//REMOVE LE COMMENTAIRE SUR GETINFO POUR START THREE JS

//getInfo();

function animate() {
    setTimeout( function() {
        requestAnimationFrame( animate );
        
        axios.get(`http://${ip}:6721/session`).then(resp => {   
            try {
                let disc = resp.data.disc.position
                let disk = scene.getObjectByName( "disk", true )
                disk.position.set(disc[0], disc[1], disc[2]);
                //camera.lookAt(disk.position)
            } catch {

            }
            for(let i in resp.data.teams[0].players) {
                try {

                    //set les positions au cube a partir du get
                    player = resp.data.teams[0].players[i].body;
                    playerL = resp.data.teams[0].players[i].lhand;
                    playerR = resp.data.teams[0].players[i].rhand;
                    
                    // NE MARCHE PAS CAR FAUT DONNER DES NOMS AU CUBE POUR PAS TOUS LES MODIFIER
                    for(let x in scene.children) {
                        if(scene.children[x].name == "cube"+i) {
                           
                            let body = scene.getObjectByName( "cube"+i );
                            //camera.lookAt(body.rotation)
                            body.position.set(player.position[0], player.position[1]-0.5, player.position[2]);
                            rotationMatrixOrange.set( 
                                Number((player.left[0]).toFixed(1)), Number((player.left[1]).toFixed(1)), Number((player.left[2]).toFixed(1)), 0,
                                Number((player.up[0]).toFixed(1)), Number((player.up[1]).toFixed(1)), Number((player.up[2]).toFixed(1)), 0,
                                Number((player.forward[0]).toFixed(1)), Number((player.forward[1]).toFixed(1)), Number((player.forward[2]).toFixed(1)), 0,
                                0, 0, 0, 1
                            );
                            body.rotation.setFromRotationMatrix(rotationMatrixOrange);

                        } else if (scene.children[x].name == "handL"+i) {
                            let hand = scene.getObjectByName( "handL"+i );
                            hand.position.set(playerL.pos[0], playerL.pos[1], playerL.pos[2]);
                        } else if (scene.children[x].name == "handR"+i) {
                            let hand = scene.getObjectByName( "handR"+i );
                            hand.position.set(playerR.pos[0], playerR.pos[1], playerR.pos[2]);
                        }
                    }

                    //vector to rotation

                    let velocity = resp.data.teams[0].players[i].velocity
                    console.log(velocity)
                } catch {
                }
            }
                
            for(let i in resp.data.teams[1].players) {
                try {
                    let mathI = +i+4;
                    player = resp.data.teams[1].players[i].body;
                    playerL = resp.data.teams[1].players[i].lhand;
                    playerR = resp.data.teams[1].players[i].rhand;
                    
                    for(let x in scene.children) {
                        if(scene.children[x].name == "cube"+mathI) {
                            let body = scene.getObjectByName( "cube"+mathI );
                            body.position.set(player.position[0], player.position[1]-0.5, player.position[2]);
                            
                            rotationMatrixBlue.set( 
                                Number((player.left[0]).toFixed(1)), Number((player.left[1]).toFixed(1)), Number((player.left[2]).toFixed(1)), 0,
                                Number((player.up[0]).toFixed(1)), Number((player.up[1]).toFixed(1)), Number((player.up[2]).toFixed(1)), 0,
                                Number((player.forward[0]).toFixed(1)), Number((player.forward[1]).toFixed(1)), Number((player.forward[2]).toFixed(1)), 0,
                                0, 0, 0, 1
                            );

                            body.rotation.setFromRotationMatrix(rotationMatrixOrange);

                        } else if (scene.children[x].name == "handL"+mathI) {
                            let hand = scene.getObjectByName( "handL"+mathI );
                            hand.position.set(playerL.pos[0], playerL.pos[1], playerL.pos[2]);
                        } else if (scene.children[x].name == "handR"+mathI) {
                            let hand = scene.getObjectByName( "handR"+mathI );
                            hand.position.set(playerR.pos[0], playerR.pos[1], playerR.pos[2]);
                        }
                    }

                    let velocity = resp.data.teams[1].players[i].velocity

                    //Data logs
                    
                    // console.log(resp.data.teams[1].players[i].name)
                    // console.log(resp.data.teams[1].players[i].lhand)
                    // console.log(resp.data.teams[1].players[i].body)
    
                    //end

                } catch {
                    console.log('err')
                }
            } 
            renderer.render( scene, camera );
        })

    }, 10 );
}

//Detection collision End (threejs)

//Analyse données vers haptique start

let pseudo = "Couto26";
let team; 
let index;
let playerid;
let orangepoints;
let bluepoints;
let teamlen;
let stuns;
let lastVel = 0;
let errorCode;

setInterval(() => {
    axios.get(`http://${ip}:6721/session`).then(resp => { 
    function playId() {
        let arr0 = resp.data.teams[0].players;
        if(arr0.some(item => item.name === pseudo)) {
            team = 0; 
            teamlen = arr0.length;
            index = arr0.findIndex((element, index) => {if (element.name === pseudo) {return true}})
            playerid = resp.data.teams[team].players[index].playerid;
            stuns = resp.data.teams[team].players[index].stats.stuns
        }
        let arr1 = resp.data.teams[1].players;
        
        if(arr1.some(item => item.name === pseudo)) {
            team = 1;
            teamlen = arr1.length
            index = arr1.findIndex((element, index) => {if (element.name === pseudo) {return true}})
            playerid = resp.data.teams[team].players[index].playerid
        }
        orangepoints = resp.data.orange_points;
        bluepoints = resp.data.blue_points;
    }
    if(team == undefined) {
        playId()
    } else {

        //player left ?

        if(teamlen != resp.data.teams[team].players.length) playId()

        let player = resp.data.teams[team].players[index]

        //stunned ?

        if(player.stunned == true) {
            console.log('stunned')
            errorCode = tactJs.submitRegistered('stunned');
            console.log(errorCode)
        }
    
        //someone grab my back ? (dure 10ms donc tant que grab on submit)
        
        for(let i in resp.data.teams[0].players) {
            if(resp.data.teams[0].players[i].holding_right == playerid || resp.data.teams[0].players[i].holding_left == playerid) {
                console.log('grab back')
                errorCode = tactJs.submitRegistered('grab');
                console.log(errorCode)
            }
        }
        for(let i in resp.data.teams[1].players) {
            if(resp.data.teams[1].players[i].holding_right == playerid || resp.data.teams[1].players[i].holding_left == playerid) {
                errorCode = tactJs.submitRegistered('grab');
                console.log(errorCode)
                console.log('grab back')
            }
        }

        //point score ?

        if(orangepoints != resp.data.orange_points) {
            errorCode = tactJs.submitRegistered('goal');
            console.log(errorCode)
            orangepoints = resp.data.orange_points
        }
        if(bluepoints != resp.data.blue_points) {
            bluepoints = resp.data.blue_points
            errorCode = tactJs.submitRegistered('goal');
            console.log(errorCode)
        } 

        //blocking ?

        if(player.blocking == true) {
            errorCode = tactJs.submitRegistered('shield');
            console.log(errorCode)
            console.log('blocking')
        }


        //stun qlq ?

        if(player.stats.stuns != stuns) {
            console.log('Stun qlq')
            stuns = player.stats.stuns;
            errorCode = tactJs.submitRegistered('stun');
            console.log(errorCode)
        }

        //ta manger un mur pélo ?
        let velocity = resp.data.teams[team].players[index].velocity
        let pyVeloc = Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2)+ Math.pow(velocity[2], 2)
        if(lastVel/2 > pyVeloc && lastVel > 24) {
            errorCode = tactJs.submitRegistered('mur');
            console.log(errorCode)
            console.log('DANS TA GEULE LE MUR')
        }
        lastVel = pyVeloc
    }

})
}, 10);

//Analyse données vers haptique end

//Bhaptics part

tactJs.addListener(function(msg) {
    if (msg.status === 'Connected') {
      console.log('connected');

    } else if (msg.status === 'Disconnected') {
  
    } else if (msg.status === 'Connecting') {

    }
});
function registerFile(feedbackFile) {
    fetch("./tact/" + feedbackFile + '.tact')
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {
        tactJs.registerFile(feedbackFile, JSON.stringify(json));
      })
      .catch(function(e) {
        console.log('error', e)
    });
}

registerFile('goal')
registerFile('grab')
registerFile('mur')
registerFile('shield')
registerFile('stun')
registerFile('stunned')