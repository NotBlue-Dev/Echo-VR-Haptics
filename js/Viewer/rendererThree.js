//module
const axios = require('axios');

//three js
import * as THREE from '../import/threejs/r130/build/three.module.js';
import { GLTFLoader } from '../import/threejs/r130/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../import/threejs/r130/examples/jsm/controls/OrbitControls.js';

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

let geometry = new THREE.BoxGeometry();
let material = new THREE.MeshBasicMaterial({color: 0xfffff, wireframe: true});

let cube1 = new THREE.Mesh(geometry, material);
cube1.position.set(0,0,40)
let cube2 = new THREE.Mesh(geometry, material);
cube2.position.set(0,0,-40)
let cube3 = new THREE.Mesh(geometry, material);
cube3.position.set(15,0,0)
let cube4 = new THREE.Mesh(geometry, material);
cube4.position.set(-15,0,0)
let cube5 = new THREE.Mesh(geometry, material);
cube5.position.set(0,10,0)
let cube6 = new THREE.Mesh(geometry, material);
cube6.position.set(0,-10,0)

scene.add(cube1);
scene.add(cube2);
scene.add(cube3);
scene.add(cube4);
scene.add(cube5);
scene.add(cube6);

camera.position.z = 1;

controls.update();

let player;
let playerL;
let playerR;
let velocity;

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
        
        root.position.x = 0.3;
        root.position.y = -2.1;
        root.scale.set(1,0.9,1);
        root.rotation.y = 1.57;
        scene.add(root);
    });

    let z = 0
    for (var i = 0; i <= 7; i++) {
        loaders.load('model/body.glb', (gltf) => {
            const root = gltf.scene;
            root.name = "cube"+z
            z++
            // root.rotation.z = Math.PI/2 
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

getInfo();

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
                    velocity = resp.data.teams[0].players[i].velocity
                    // NE MARCHE PAS CAR FAUT DONNER DES NOMS AU CUBE POUR PAS TOUS LES MODIFIER
                    for(let x in scene.children) {
                        if(scene.children[x].name == "cube"+i) {
                           
                            let body = scene.getObjectByName( "cube"+i );
                            
                            body.position.set(player.position[0], player.position[1]-0.5, player.position[2]);
                            rotationMatrixOrange.set( 
                                Number((player.left[0]).toFixed(1)), Number((player.left[1]).toFixed(1)), Number((player.left[2]).toFixed(1)), 0,
                                Number((player.up[0]).toFixed(1)), Number((player.up[1]).toFixed(1)), Number((player.up[2]).toFixed(1)), 0,
                                Number((player.forward[0]).toFixed(1)), Number((player.forward[1]).toFixed(1)), Number((player.forward[2]).toFixed(1)), 0,
                                0, 0, 0, 1
                            );
                            body.rotation.setFromRotationMatrix(rotationMatrixOrange);

                            let pyVeloc = Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2)+ Math.pow(velocity[2], 2)
                            let degInclin;
                            if(pyVeloc*3.4 >= 85) {
                                degInclin = 85
                            } else {
                                degInclin = pyVeloc*3.4
                            }
                            degInclin = 2 * Math.PI * (degInclin / 360); 
                            body.rotation.x = degInclin
                        } else if (scene.children[x].name == "handL"+i) {
                            let hand = scene.getObjectByName( "handL"+i );
                            hand.position.set(playerL.pos[0], playerL.pos[1], playerL.pos[2]);
                        } else if (scene.children[x].name == "handR"+i) {
                            let hand = scene.getObjectByName( "handR"+i );
                            hand.position.set(playerR.pos[0], playerR.pos[1], playerR.pos[2]);
                        }
                    }

                } catch {
                }
            }
                
            for(let i in resp.data.teams[1].players) {
                try {
                    let mathI = +i+4;
                    player = resp.data.teams[1].players[i].body;
                    playerL = resp.data.teams[1].players[i].lhand;
                    playerR = resp.data.teams[1].players[i].rhand;
                    velocity = resp.data.teams[1].players[i].velocity

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
                            
                            let pyVeloc = Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2)+ Math.pow(velocity[2], 2)
                            let degInclin;
                            if(pyVeloc*3.4 >= 85) {
                                degInclin = 85
                            } else {
                                degInclin = pyVeloc*3.4
                            }
                            degInclin = 2 * Math.PI * (degInclin / 360); 

                            body.rotation.setFromRotationMatrix(rotationMatrixOrange);

                            body.rotation.x = degInclin

                        } else if (scene.children[x].name == "handL"+mathI) {
                            let hand = scene.getObjectByName( "handL"+mathI );
                            hand.position.set(playerL.pos[0], playerL.pos[1], playerL.pos[2]);
                        } else if (scene.children[x].name == "handR"+mathI) {
                            let hand = scene.getObjectByName( "handR"+mathI );
                            hand.position.set(playerR.pos[0], playerR.pos[1], playerR.pos[2]);
                        }
                    }
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

    }, 30 );
}

//Detection collision End (threejs)