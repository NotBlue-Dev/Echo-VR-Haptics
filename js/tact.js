const tactJs = require('./tact-js/tact-js.umd.js')
const fs = require('fs')
let connect = false;
    

module.exports = function() {
    return connection()
}

//## BUG ##
//la lib bhaptic catch pas si le player est pas allumer et ca fais tout crash

function connection() {
    return new Promise((resolve, reject) => {
        tactJs.default.addListener(function(msg) {
            if (msg.status === 'Connected' && connect == false) {
                connect = true;
                config.files.forEach((value, index, array) => {
                    tactJs.default.registerFile(value.name ,fs.readFileSync(`./assets/${value.file}`).toString())
                })
                console.log('Tact file Loaded')
                resolve(true);
            }
        });
        //effet de ping pour le gilet 
        tactJs.default.registerFile('ping', '{"ping":"pong"}');
    })

}
