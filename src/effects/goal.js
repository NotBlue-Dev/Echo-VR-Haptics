class Goal {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options

        this.orangePoints = null
        this.bluePoints = null
    }

    handle(gameData) {
        if (this.orangePoints === null || this.bluePoints === null) {
            this.bluePoints = gameData.bluePoints
            this.orangePoints = gameData.orangePoints
            return
        }

        if (this.orangePoints !== gameData.orangePoints || this.bluePoints !== gameData.bluePoints) {
            console.log('goal')
            this.tactPlay('goal', this.options);
            this.bluePoints = gameData.bluePoints
            this.orangePoints = gameData.orangePoints
        }
    }
}

module.exports = Goal
