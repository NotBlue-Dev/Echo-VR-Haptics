const tactJs = require('../tact-js/tact-js.umd.js')
const fs = require('fs');
const path = require('path')

class BHapticsTactJsAdapter {
    constructor() {
        this.connected = false
        this.handleFileLoaded = () => {}
        this.handleConnecting = () => {}
        this.handleConnected = () => {}
        this.handleDisconnected = () => {}
        this.initialize()
     }

    onFileLoaded(callback) {
        this.handleFileLoaded = callback
        return this
    }

    onConnecting(callback) {
        this.handleConnecting = callback
        return this
    }

    onConnected(callback) {
        this.handleConnected = callback
        return this
    }

    onDisconnected(callback) {
        this.handleDisconnected = callback
        return this
    }

    connect() {
        tactJs.default.registerFile('ping', '{"ping":"pong"}');
        tactJs.default.socket.connect()
    }

    initialize() {
        tactJs.default.addListener((message) => {
            if (message.status === 'Connecting') {
                return this.handleConnecting()
            }

            if (message.status === 'Connected') {
                if(this.connected != true) {
                    this.connected = true
                    this.handleConnected('BHaptic Player')
                    this.loadTactFiles()
                }
            }

            if (message.status === 'Disconnected') {
                this.connected = false
                this.handleDisconnected(message.message)
            }
        });
    }

    playEffect(name, options) {
        tactJs.default.submitRegisteredWithScaleOption(name, options)
    }

    loadTactFiles() {
        fs.readdir(path.join(__dirname, '../../assets'), {}, (err, files) => {
            files.filter((file) => {
                return file.match(/([A-z]+).tact$/g) !== null
            }).forEach((value) => {
                tactJs.default.registerFile(value.split('.')[0] ,fs.readFileSync(path.join(__dirname, `../../assets/${value}`)).toString())
                this.handleFileLoaded(value)
            })
        })
    }
}

module.exports = BHapticsTactJsAdapter
