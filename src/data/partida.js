const { MessageActionRow, MessageButton } = require('discord.js');

class Partida {
  constructor(timeA, timeB) {
    this.times = {
      A: timeA.map(p => ({ ...p, comBola: false, stamina: 100 })),
      B: timeB.map(p => ({ ...p, comBola: false, stamina: 100 }))
    };
    this.bola = { comJogador: null, zona: 'meio' }; // zonas: defesaA, meio, ataqueB
    this.turno = 'A'; // time que começa
  }

  // Cara ou coroa para definir quem começa
  iniciar() {
    const allPlayers = [...this.times.A, ...this.times.B];
    const sorteado = allPlayers[Math.floor(Math.random() * allPlayers.length)];
    sorteado.comBola = true;
    this.bola.comJogador = sorteado.nome;
    this.bola.zona = 'meio';
    return sorteado;
  }

  // Retorna jogador da vez
  jogadorDaVez() {
    const allPlayers = this.times[this.turno];
    // pega primeiro jogador com stamina > 0
    return allPlayers.find(p => p.stamina > 0) || null;
  }

  // Alterna turno
  proximoTurno() {
    this.turno = this.turno === 'A' ? 'B' : 'A';
  }

  // Cria botões para jogador humano
  gerarBotoes() {
    const row = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('driblar').setLabel('Driblar').setStyle('PRIMARY'),
      new MessageButton().setCustomId('chutar').setLabel('Chutar').setStyle('DANGER'),
      new MessageButton().setCustomId('passar').setLabel('Passar').setStyle('SUCCESS'),
      new MessageButton().setCustomId('descansar').setLabel('Descansar').setStyle('SECONDARY')
    );
    return row;
  }

  // Executa ação do jogador ou NPC
  executarAcao(jogador, acao, alvo = null) {
    if (jogador.stamina <= 0) {
      return `${jogador.nome} está exausto e precisa descansar.`;
    }

    let msg = '';
    switch (acao) {
      case 'driblar':
        if (Math.random() * 20 + jogador.atributos.drible > 10) {
          msg = `${jogador.nome} driblou com sucesso!`;
        } else {
          msg = `${jogador.nome} perdeu a bola!`;
          this.bola.comJogador = null;
          jogador.comBola = false;
          this.tentarRoubo(this.times[this.turno === 'A' ? 'B' : 'A']);
        }
        jogador.stamina -= 10;
        break;

      case 'chutar':
        if (Math.random() * 20 + jogador.atributos.chute > 12) {
          msg = `${jogador.nome} chutou e marcou um gol! ⚽`;
          this.resetBola();
        } else {
          msg = `${jogador.nome} chutou e errou!`;
          this.resetBola();
        }
        jogador.stamina -= 15;
        break;

      case 'passar':
        if (alvo) {
          msg = `${jogador.nome} passou a bola para ${alvo.nome}`;
          jogador.comBola = false;
          alvo.comBola = true;
          this.bola.comJogador = alvo.nome;
        } else {
          msg = 'Passo inválido!';
        }
        jogador.stamina -= 5;
        break;

      case 'descansar':
        jogador.stamina += 20;
        if (jogador.stamina > 100) jogador.stamina = 100;
        msg = `${jogador.nome} descansou e recuperou stamina.`;
        break;
    }

    // Alterna turno
    this.proximoTurno();
    return msg;
  }

  // Tenta roubar a bola (para NPC ou jogador automático)
  tentarRoubo(timeAdversario) {
    const possiveis = timeAdversario.filter(p => p.stamina > 0);
    if (possiveis.length === 0) return;

    const atacante = possiveis[Math.floor(Math.random() * possiveis.length)];
    if (Math.random() * 20 + atacante.atributos.marcacao > 10) {
      atacante.comBola = true;
      this.bola.comJogador = atacante.nome;
    }
  }

  resetBola() {
    this.bola.comJogador = null;
    this.bola.zona = 'meio';
    this.times.A.forEach(p => (p.comBola = false));
    this.times.B.forEach(p => (p.comBola = false));
  }
}

module.exports = Partida;
