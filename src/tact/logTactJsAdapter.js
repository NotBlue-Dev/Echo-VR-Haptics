class LogTactJsAdapter {
    constructor() {
        this.handleConnected = () => {}
     }

    onFileLoaded() {
        return this
    }

    onConnecting() {
        return this
    }

    onConnected(callback) {
        this.handleConnected = callback
        return this
    }

    onDisconnected() {
        return this
    }

    connect() {
        this.handleConnected('LogHaptics')
    }

    playEffect(name) {
        console.log('effect', name);
    }
}

module.exports = LogTactJsAdapter