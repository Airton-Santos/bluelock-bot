const matches = new Map(); // chave = código da sala, valor = objeto da partida

class Match {
    constructor(masterId) {
        this.masterId = masterId;
        this.code = Match.generateCode();
        this.players = []; // players humanos
        this.npcs = [];    // NPCs adicionados
        this.started = false;
    }

    static generateCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    addPlayer(player) {
        if (this.players.length >= 11) return false;
        this.assignTeam(player); // define time baseado nos jogadores atuais
        this.players.push(player);
        return true;
    }

    addNPC(npc, time = 'B') {
        this.npcs.push({ ...npc, time });
    }

    assignTeam(player) {
        const teamACount = this.players.filter(p => p.time === 'A').length;
        const teamBCount = this.players.filter(p => p.time === 'B').length;
        player.time = teamACount <= teamBCount ? 'A' : 'B';
    }

    getAllPlayers() {
        return [...this.players, ...this.npcs];
    }
}

module.exports = { Match, matches };
