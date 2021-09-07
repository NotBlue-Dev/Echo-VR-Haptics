class Shield {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options

        this.block = false
    }

    handle(gameData) {
        if (gameData.player.blocking === true && this.block === false) {
            this.block = true;
            this.tactPlay('shield', this.options)
            setTimeout(() => {
                this.block = false;
            }, 400);
        }
    }
}

module.exports = Shield
