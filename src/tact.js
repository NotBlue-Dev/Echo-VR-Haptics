const tactJs = require('./tact-js/tact-js.umd.js')
const fs = require('fs');

class Tact {
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
        tactJs.default.socket.connect()
    }

    initialize() {
        tactJs.default.addListener((message) => {
            if (message.status === 'Connecting') {
                this.connected = false
                return this.handleConnecting()
            }

            if (message.status === 'Connected') {
                this.connected = true
                this.handleConnected()
                this.loadTactFiles()
            }

            if (message.status === 'Disconnected') {
                this.connected = false
                this.handleDisconnected(message.message)
            }
        });
    }

    loadTactFiles() {
        fs.readdir(__dirname + '/../assets', {}, (err, files) => {
            files.filter((file) => {
                return file.match(/([A-z]+).tact$/g) !== null
            }).forEach((value) => {
                tactJs.default.registerFile(name ,require(`../assets/${value}`).stringify())
                this.handleFileLoaded(value)
            })
        })
    }
}

module.exports = new Tact()
