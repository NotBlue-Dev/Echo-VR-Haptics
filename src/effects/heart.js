class Heart {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options
        this.interval = null
        this.end = false
    }

    handle(gameData) {
        const tempClock = gameData.clock
        if (tempClock < 30 && this.end === false && gameData.isInMatch() && gameData.isPlaying()) {
            this.end = true;
            let heartBeat = setInterval(() => {
                this.tactPlay('heart', this.options);
            }, 800);
            this.interval = heartBeat
        }
        if ((!(gameData.isInMatch()) || !(gameData.isPlaying())) && this.end === true) {
            this.end = false
            clearInterval(this.interval)
        }
    }
}

module.exports = Heart
