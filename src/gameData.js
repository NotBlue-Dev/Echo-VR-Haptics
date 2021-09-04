class GameData {
    constructor(json) {
        const playerName = json.data.client_name;
        this.blueTeamPlayers = json.data.teams[0].players;
        this.orangeTeamPlayers = json.data.teams[1].players;

        if (this.blueTeamPlayers === undefined && this.orangeTeamPlayers === undefined) {
            return
        }

        if(this.blueTeamPlayers !== undefined && this.blueTeamPlayers.some(item => item.name === playerName)) {
            this.playerTeamIndex = 0;
            this.playerTeamLength = this.blueTeamPlayers.length;
            this.playerIndex = this.blueTeamPlayers.findIndex((element) => { return (element.name === playerName)})
        } else if(this.orangeTeamPlayers !== undefined && this.orangeTeamPlayers.some(item => item.name === playerName)) {
            this.playerTeamIndex = 1;
            this.playerTeamLength = this.orangeTeamPlayers.length
            this.playerIndex = this.orangeTeamPlayers.findIndex((element) => { return (element.name === playerName)})
        }

        this.orangepoints = json.data.orange_points;
        this.bluepoints = json.data.blue_points;
        this.status = json.data.game_status;
        this.clockDisplay = json.data.game_clock_display;

        if (this.isPlayerInGame()) {
            this.playerTeam = json.data.teams[this.playerTeamIndex]
            this.player = this.playerTeam.players[this.playerIndex]
            this.playerId = this.player.playerid;

            this.enemyTeamPlayers = json.data.teams[Math.abs(this.playerTeamIndex - 1)].players
        }

        this.matchType = json.data.match_type
    }

    isPlayerInGame() {
        // Ça me paraît bizarre comme condition
        return this.playerTeamIndex !== null || this.playerIndex !== null;
    }

    isInMatch() {
        return this.matchType === 'Echo_Arena' && this.matchType === 'Echo_Arena_Private'
    }

    isPlaying() {
        return this.status === 'playing'
    }
}

module.exports = GameData
