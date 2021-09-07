class Stunned {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options

        this.stunned = false
    }

    handle(gameData) {
        const player = gameData.player
        if (player.stunned === true && this.stunned === false) {
            this.stunned = true;
            this.tactPlay('stunned', this.options)
            setTimeout(() => {
                this.stunned = false;
            }, 3000);
        }
    }
}

module.exports = Stunned
