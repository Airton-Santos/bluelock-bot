const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { registrarAcao } = require('../utils/partidaStatus');
const Player = require('../models/player'); // 🔥 necessário pra buscar fome do banco

const partidasPath = path.join(__dirname, '../data/PartidasOn.js');

module.exports = {
  name: 'a',
  description: 'Executa uma ação de um jogador',
  async execute(message, args) {
    const discordId = message.author.id;
    const acao = args[0]?.toLowerCase();
    const alvoNome = args[1]?.toLowerCase();

    if (!acao) return message.reply('❌ Use: !a <ação> [alvo]');

    delete require.cache[require.resolve(partidasPath)];
    let partidasOn = require(partidasPath);

    const partidaCode = Object.keys(partidasOn)[0];
    const partida = partidasOn[partidaCode];
    if (!partida) return message.reply('❌ Nenhuma partida ativa!');

    const jogador = partida.players.find(p => p.discordId === discordId);
    if (!jogador) return message.reply('❌ Jogador não encontrado!');

    // 🔍 Busca fome real do banco de dados
    const playerDB = await Player.findOne({ discordId });
    const fome = playerDB?.fome ?? 100;

    if (!jogador.atributos) jogador.atributos = {};
    if (jogador.atributos.stamina == null) jogador.atributos.stamina = 100;

    if (jogador.atributos.stamina <= 0)
      return message.reply('❌ Você não tem stamina para fazer esta ação!');

    let msg = '';
    const dado = Math.floor(Math.random() * 20) + 1;
    let alvo = null;

    if (alvoNome) {
      alvo = partida.players.find(p => p.nome.toLowerCase() === alvoNome);
      if (!alvo) return message.reply('❌ Alvo não encontrado!');
      if (!alvo.atributos) alvo.atributos = {};
      if (alvo.atributos.stamina == null) alvo.atributos.stamina = 100;
    }

    let atributoUsado = 0;
    let staminaGasta = 0;

    switch (acao) {
      case 'passar':
        atributoUsado = jogador.atributos.passe || 0;
        staminaGasta = 5;
        break;
      case 'chutar':
      case 'chutarlonge':
        atributoUsado = (jogador.atributos.chute || 0) + (jogador.atributos.precisao || 0);
        staminaGasta = 10;
        break;
      case 'driblar':
        atributoUsado = (jogador.atributos.drible || 0) + (jogador.atributos.agilidade || 0);
        staminaGasta = 8;
        break;
      case 'esperar':
        atributoUsado = 0;
        staminaGasta = 1;
        break;
      case 'marcar':
        atributoUsado = (jogador.atributos.marcacao || 0) + (jogador.atributos.forca || 0);
        staminaGasta = 7;
        break;
      case 'desarme':
        atributoUsado = (jogador.atributos.forca || 0) + (jogador.atributos.marcacao || 0);
        staminaGasta = 8;
        break;
      case 'mover':
        atributoUsado = jogador.atributos.velocidade || 0;
        staminaGasta = 5;
        break;
      case 'defender':
        atributoUsado = (jogador.atributos.reflexo || 0) + (jogador.atributos.defesa || 0);
        staminaGasta = 10;
        break;
      case 'descansar':
        jogador.atributos.stamina += 20;
        if (jogador.atributos.stamina > 100) jogador.atributos.stamina = 100;
        msg = `${jogador.nome} descansou e recuperou stamina.`;
        break;
      default:
        return message.reply('❌ Ação inválida!');
    }

    if (acao !== 'descansar') {
      jogador.atributos.stamina -= staminaGasta;
      if (jogador.atributos.stamina < 0) jogador.atributos.stamina = 0;

      // 🧠 Aplica penalidade de fome
      let penalidadeFome = 0;
      if (fome <= 0) penalidadeFome = -5;

      const resultado = dado + atributoUsado + penalidadeFome;
      const fomeTexto = penalidadeFome ? ' (-5 por fome 0)' : '';

      msg = `${jogador.nome} realizou a ação **${acao}**. 🎲 Dado (1d20): ${dado} + Atributo: ${atributoUsado}${fomeTexto} = **${resultado}**`;
    }

    const aviso = registrarAcao(partida, "player");
    if (aviso) message.channel.send(aviso);

    fs.writeFileSync(partidasPath, `module.exports = ${JSON.stringify(partidasOn, null, 2)};`);

    const embed = new EmbedBuilder()
      .setTitle('🎮 Ação do Jogador')
      .addFields(
        { name: 'Jogador', value: jogador.nome, inline: true },
        { name: 'Ação', value: acao, inline: true },
        { name: 'Resultado', value: msg },
        { name: 'Stamina', value: `${jogador.atributos.stamina}`, inline: true },
        { name: 'Fome', value: `${fome}`, inline: true }
      )
      .setColor(fome <= 0 ? '#FF0000' : '#00FF00');

    message.channel.send({ embeds: [embed] });
  }
};
