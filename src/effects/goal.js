class Goal {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options

        this.orangePoints = null
        this.bluePoints = null
    }

    handle(gameData) {
        if (this.orangePoints === null || this.bluePoints === null) {
            this.bluePoints = gameData.bluepoints
            this.orangePoints = gameData.orangepoints
            return
        }
        if (this.orangePoints != gameData.orangepoints || this.bluePoints != gameData.bluepoints) {
            this.tactPlay('goal', this.options);
            this.bluePoints = gameData.bluepoints
            this.orangePoints = gameData.orangepoints
        }
    }
}

module.exports = Goal
