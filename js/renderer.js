
const axios = require('axios');

//let ip = '192.168.1.53'
let ip = 'localhost'

let pseudo = ""

//On crée la scene et le renderer/objet
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const geometry = new THREE.BoxGeometry(0.5,0.8,0.5);
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

const geometryHand = new THREE.BoxGeometry(0.3,0.3,0.3);
const materialHand = new THREE.MeshBasicMaterial( { color: 0x6600cc } );

const geometryDisk = new THREE.TorusGeometry(0.2,0.05,10,6);
const materialDisc = new THREE.MeshBasicMaterial( { color: 0xfefefe } );
const disk = new THREE.Mesh( geometryDisk, materialDisc );

scene.add( disk );

let rotationMatrixOrange = new THREE.Matrix4();
let rotationMatrixBlue = new THREE.Matrix4();

//on crée des obj sous forme nom"i"
for (var i = 0; i <= 7; i++) {
    a = this["cube"+i] = new THREE.Mesh( geometry, material );
    scene.add( a );
}

for (var i = 0; i <= 7; i++) {
    a = this["handL"+i] = new THREE.Mesh( geometryHand, materialHand );
    scene.add( a );
}

for (var i = 0; i <= 7; i++) {
    a = this["handR"+i] = new THREE.Mesh( geometryHand, materialHand );
    scene.add( a );
}


camera.position.z = 5;

let team;
let index;
let contactL;
let contactR;
let player;
let init = false;

function getInfo() {
    setInterval(() => {
        axios.get(`http://${ip}:6721/session`).then(resp => {   
        if(team == undefined && pseudo != "") {
            arr0 = resp.data.teams[0].players;
            
            if(arr0.some(item => item.name === pseudo)) {
                team = 0; 
                index = arr0.findIndex((element, index) => {if (element.name === pseudo) {return true}})
            }
            arr1 = resp.data.teams[1].players;
            
            if(arr1.some(item => item.name === pseudo)) {
                team = 1;
                index = arr1.findIndex((element, index) => {if (element.name === pseudo) {return true}})
            }
        }

        if(pseudo != "") {
            player = resp.data.teams[team].players[index].body;

            for(let x=0; x<=1; x++) {

                for(i in resp.data.teams[x].players) {
                    playerL = resp.data.teams[x].players[i].lhand;
                    playerR = resp.data.teams[x].players[i].rhand;

                    //CALCUL VECTEUR INUTILE POUR L INSTANT

                    // vector1 = []
                    // vector1.push(player.position[0] * player.forward[0], player.position[0] * player.forward[1], player.position[0] * player.forward[2])

                    // vector2 = []
                    // vector2.push(player.position[1] * player.left[0], player.position[1] * player.left[1], player.position[1] * player.left[2])

                    // vector3 = []
                    // vector3.push(player.position[2] * player.up[0], player.position[2] * player.up[1], player.position[2] * player.up[2])
                    
                    // vectorFinal = []
                    // vectorFinal.push(vector1[0]+vector2[0]+vector3[0], vector1[1]+vector2[1]+vector3[1], vector1[2]+vector2[2]+vector3[2])
                    

                    // vectorHandL1 = []
                    // vectorHandL1.push(playerL.pos[0] * playerL.forward[0], playerL.pos[0] * playerL.forward[1], playerL.pos[0] * playerL.forward[2])

                    // vectorHandL2 = []
                    // vectorHandL2.push(playerL.pos[1] * playerL.left[0], playerL.pos[1] * playerL.left[1], playerL.pos[1] * playerL.left[2])

                    // vectorHandL3 = []
                    // vectorHandL3.push(playerL.pos[2] * playerL.up[0], playerL.pos[2] * playerL.up[1], playerL.pos[2] * playerL.up[2])
                    
                    // vectorHandLFinal = []
                    // vectorHandLFinal.push(vectorHandL1[0]+vectorHandL2[0]+vectorHandL3[0], vectorHandL1[1]+vectorHandL2[1]+vectorHandL3[1], vectorHandL1[2]+vectorHandL2[2]+vectorHandL3[2])
                    
                    // vectorHandR1 = []
                    // vectorHandR1.push(playerR.pos[0] * playerR.forward[0], playerR.pos[0] * playerR.forward[1], playerR.pos[0] * playerR.forward[2])

                    // vectorHandR2 = []
                    // vectorHandR2.push(playerR.pos[1] * playerR.left[0], playerR.pos[1] * playerR.left[1], playerR.pos[1] * playerR.left[2])

                    // vectorHandR3 = []
                    // vectorHandR3.push(playerR.pos[2] * playerR.up[0], playerR.pos[2] * playerR.up[1], playerR.pos[2] * playerR.up[2])
                    
                    // vectorHandRFinal = []
                    // vectorHandRFinal.push(vectorHandR1[0]+vectorHandR2[0]+vectorHandR3[0], vectorHandR1[1]+vectorHandR2[1]+vectorHandR3[1], vectorHandR1[2]+vectorHandR2[2]+vectorHandR3[2])

                    // DisHandL = Math.sqrt(Math.pow(vectorFinal[0]-vectorHandLFinal[0], 2)+Math.pow(vectorFinal[1]-vectorHandLFinal[1], 2)+Math.pow(vectorFinal[2]-vectorHandLFinal[2], 2))
                    // DisHandR = Math.sqrt(Math.pow(vectorFinal[0]-vectorHandRFinal[0], 2)+Math.pow(vectorFinal[1]-vectorHandRFinal[1], 2)+Math.pow(vectorFinal[2]-vectorHandRFinal[2], 2))
                    // console.log(vectorHandLFinal, vectorHandRFinal, vectorFinal, resp.data.teams[x].players[i].name)
                    
                    //END CALCUL VECTEUR

                    //TEST DETECTION COLISION CASSER CAR ON A PAS LA DIRECTION DU CHEST

                    //si hand posX entre 18 et -18 par rapport au body contact pour la position x, same pour le restes
                    
                    // if((playerL.pos[0] <= player.position[0]+0.18 && playerL.pos[0] >= player.position[0]-0.18)){
                    //     if((playerL.pos[1] <= player.position[1]+0.64 && playerL.pos[1] >= player.position[1]-0.64)) {
                    //         if((playerL.pos[2] <= player.position[2]+0.20 && playerL.pos[2] >= player.position[2]-0.20)) {
                    //             if(resp.data.teams[x].players[i].name != pseudo) {
                    //                 console.log(playerR.pos[0], playerR.pos[1], playerR.pos[2])
                    //                 console.log(playerL.pos[0], playerL.pos[1], playerL.pos[2])
                    //                 console.log(player.position[0], player.position[1], player.position[2])
                    //                 console.log(`contact LEFT ${resp.data.teams[x].players[i].name} IN ${pseudo}  TEAM ${x}`) 
                    //             } 
                    //         }
                    //     }
                    // }              

                    //END
                }
            }
        } else if (pseudo == "" && init == false) {
            init = true;
            animate()
            console.log('sssss')
        }
    });
    }, 100);
}

getInfo();

function animate() {
    setTimeout( function() {
        requestAnimationFrame( animate );
        axios.get(`http://${ip}:6721/session`).then(resp => {   
            disc = resp.data.disc.position
            disk.position.set(disc[0], disc[1], disc[2]);
    
            for(i in resp.data.teams[0].players) {
                try {
                    //set les positions au cube a partir du get
                    player = resp.data.teams[0].players[i].body;
                    window['cube' + i].position.set(player.position[0], player.position[1]-0.5, player.position[2]);

                    playerL = resp.data.teams[0].players[i].lhand;
                    playerR = resp.data.teams[0].players[i].rhand;
                    
                    //test matrix

                    rotationMatrixOrange.set( 
                    player.left[0]  ,player.left[1]  ,player.left[2] ,0
                    ,player.up[0]  ,player.up[1]  ,player.up[2]  ,0
                    ,player.forward[0]  ,player.forward[1]  ,player.forward[2]  ,0
                    ,0  ,0  ,0  ,1
                    );
                    window['cube' + i].quaternion.setFromRotationMatrix(rotationMatrixOrange);

                    //end

                    //TEST ORIENTATION 2 WORKING



                    //end test 2

                    window['handL' + i].position.set(playerL.pos[0], playerL.pos[1], playerL.pos[2]);
                    window['handR' + i].position.set(playerR.pos[0], playerR.pos[1], playerR.pos[2]);
                } catch {
                    console.log('err')
                }    
            }
                
            for(i in resp.data.teams[1].players) {
                try {
                    let mathI = +i+4;
                    player = resp.data.teams[1].players[i].body;
                    window['cube' + mathI].position.set(player.position[0], player.position[1]-0.5, player.position[2]);

                    //test matrix 3
                    rotationMatrixBlue.set( 
                    player.left[0]  ,player.left[1]  ,player.left[2] ,0
                    ,player.up[0]  ,player.up[1]  ,player.up[2]  ,0
                    ,player.forward[0]  ,player.forward[1]  ,player.forward[2]  ,0
                    ,0  ,0  ,0  ,1
                    );
                    window['cube' + i].quaternion.setFromRotationMatrix(rotationMatrixBlue);
                   
                    //end

                    //TEST ORIENTATION 2 WORKING

                    // let x = Math.atan2(Math.sqrt(Math.pow(player.forward[1],2)+Math.pow(player.forward[2],2)), player.forward[0],2)
                    // let y = Math.atan2(Math.sqrt(Math.pow(player.forward[2],2)+Math.pow(player.forward[0],2)), player.forward[1],2)
                    // let z = Math.atan2(Math.sqrt(Math.pow(player.forward[0],2)+Math.pow(player.forward[1],2)), player.forward[2],2)

                    // window['cube' + mathI].rotation.x = x
                    // window['cube' + mathI].rotation.y = y
                    // window['cube' + mathI].rotation.z = z
                    
                    //END TEST 2

                    // TEST ORIENTATION 1  NOT WORKING

                    // let yaw = Math.atan2(player.forward[1], player.forward[0])
                    // let pitch = -Math.asin(player.forward[2])
                    // let planeRightX = Math.sin(yaw);
                    // let planeRightY = -Math.cos(yaw);
                    // let roll = Math.asin(player.up[0]*planeRightX + player.up[1]*planeRightY)

                    // roll = roll * 180 / Math.PI
                    // yaw = yaw * 180 / Math.PI
                    // pitch = pitch * 180 / Math.PI
                    // console.log(roll, yaw, pitch)
                    
                    // window['cube' + mathI].rotation.x = 90
                    // window['cube' + mathI].rotation.y = yaw
                    // window['cube' + mathI].rotation.z = pitch
                    
                    //end
                    
                    //Data logs
                    
                    // console.log(resp.data.teams[1].players[i].name)
                    // console.log(resp.data.teams[1].players[i].lhand)
                    // console.log(resp.data.teams[1].players[i].body)
    
                    //end

                    playerL = resp.data.teams[1].players[i].lhand;
                    playerR = resp.data.teams[1].players[i].rhand;
                    
                    window['handL' + mathI].position.set(playerL.pos[0], playerL.pos[1], playerL.pos[2]);
                    window['handR' + mathI].position.set(playerR.pos[0], playerR.pos[1], playerR.pos[2]);
               


                } catch {
                    console.log('err')
                }
            } 
            camera.lookAt(disk.position)
            renderer.render( scene, camera );
        })

    }, 10 );
    
}
animate();
