
const axios = require('axios');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function animate() {
    requestAnimationFrame( animate );
    setInterval(() => {
        axios.get('http://127.0.0.1:6721/session').then(resp => {
        let pseudo = 'temetz'
        index = resp.data.teams[0].players.findIndex(obj => obj.name==pseudo)
        player = resp.data.teams[0].players[index].head
    });
    }, 100);
    cube.position.set(player.left, player.forward, player.up);
    renderer.render( scene, camera );
}
animate();