class Heart {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options
        this.interval = null
        this.end = false
    }

    handle(gameData) {
        const tempClock = gameData.clockDisplay
            .split('.')[0]
            .replace(":", ".")
        const clock = tempClock.replace(tempClock.charAt(0), '')
        const floatClock = +(clock)
        if (floatClock < 0.30 && this.end === false && gameData.isInMatch() && gameData.isPlaying()) {
            this.end = true;
            console.log('heartbeat')
            let heartBeat = setInterval(() => {
                if (!(gameData.isInMatch()) || !(gameData.isPlaying())) {
                    clearInterval(this.interval)
                    console.log('stop heartbeat')
                    this.end = false
                }
                this.tactPlay('heart', this.options);
            }, 800);
            this.interval = heartBeat
        }
    }
}

module.exports = Heart
