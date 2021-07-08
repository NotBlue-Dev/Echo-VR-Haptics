
const axios = require('axios');

let ip = '127.0.0.1'

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

function animate() {
    setTimeout( function() {
        requestAnimationFrame( animate );

        let player;
        axios.get(`http://${ip}:6721/session`).then(resp => {

        disc = resp.data.disc.position
        disk.position.set(disc[0], disc[1], disc[2]);

        for(i in resp.data.teams[0].players) {
            try {
                player = resp.data.teams[0].players[i].head;
                window['cube' + i].position.set(player.position[0], player.position[1]-0.5, player.position[2]);
                
                playerL = resp.data.teams[0].players[i].lhand;
                playerR = resp.data.teams[0].players[i].rhand;
                window['handL' + i].position.set(playerL.pos[0], playerL.pos[1], playerL.pos[2]);
                window['handR' + i].position.set(playerR.pos[0], playerR.pos[1], playerR.pos[2]);
            } catch {
                console.log('err')
            }

        }

        for(i in resp.data.teams[1].players) {
            try {
                let mathI = +i+4;
                player = resp.data.teams[1].players[i].head;
                window['cube' + mathI].position.set(player.position[0], player.position[1]-0.5, player.position[2]);
                
                playerL = resp.data.teams[1].players[i].lhand;
                playerR = resp.data.teams[1].players[i].rhand;
                window['handL' + mathI].position.set(playerL.pos[0], playerL.pos[1], playerL.pos[2]);
                window['handR' + mathI].position.set(playerR.pos[0], playerR.pos[1], playerR.pos[2]);
            } catch {
                console.log('err')
            }
        }
        });
        camera.lookAt(disk.position)
    }, 10 );
    
    renderer.render( scene, camera );

}
animate();