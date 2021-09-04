class Grab {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options
    }

    handle(gameData) {
        const orangePlayers = gameData.orangeTeamPlayers
        const bluePlayers = gameData.blueTeamPlayers
        const isPlaying = gameData.isPlaying()
        const playerId = gameData.playerId
        for (let i in orangePlayers) {
            if ((orangePlayers[i].holding_right === playerId || orangePlayers[i].holding_left === playerId) && isPlaying) {
                this.tactPlay('grab', this.options);
            }
        }

        for (let i in bluePlayers) {
            if ((bluePlayers[i].holding_right === playerId || bluePlayers[i].holding_left === playerId) && isPlaying) {
                this.tactPlay('grab', this.options);
            }
        }
    }
}

module.exports = Grab
