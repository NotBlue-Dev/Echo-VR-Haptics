class Grab {
    constructor(tactPlay, options) {
        this.tactPlay = tactPlay
        this.options = options
    }

    handle(gameData) {
        if (false === gameData.isPlaying()) {
            return
        }

        const orangePlayers = gameData.orangeTeamPlayers;

        for (let i in orangePlayers) {
            if (gameData.isPlayerGrabbedBy(orangePlayers[i])) {
                this.tactPlay('grab', this.options);
            }
        }

        const bluePlayers = gameData.blueTeamPlayers;
        for (let i in bluePlayers) {
            
            if (gameData.isPlayerGrabbedBy(bluePlayers[i])) {
                this.tactPlay('grab', this.options);
            }
        }
    }
}

module.exports = Grab
