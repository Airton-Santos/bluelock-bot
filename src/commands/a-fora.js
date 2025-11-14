const { EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const Player = require('../models/player'); // seu schema do bot
require('dotenv').config(); // para pegar MONGO_URI

module.exports = {
  name: 'a-livre',
  description: 'Executa uma ação livre fora de partida (não gasta stamina e sem alvo)',
  async execute(message, args) {
    const discordId = message.author.id;
    const acao = args[0]?.toLowerCase();

    if (!acao) return message.reply('❌ Use: !a-livre <ação>');

    // Conecta no MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // Busca o player pelo discordId
    const jogador = await Player.findOne({ discordId });
    if (!jogador) return message.reply('❌ Você ainda não criou um personagem!');

    if (!jogador.atributos) jogador.atributos = {};

    // Rola dado e calcula resultado
    const dado = Math.floor(Math.random() * 20) + 1;
    let atributoUsado = 0;

    switch (acao) {
      case 'chutar':
        atributoUsado = (jogador.atributos.chute || 0) + (jogador.atributos.precisao || 0);
        break;
      case 'driblar':
        atributoUsado = (jogador.atributos.drible || 0) + (jogador.atributos.agilidade || 0);
        break;
      case 'marcar':
        atributoUsado = (jogador.atributos.marcacao || 0) + (jogador.atributos.forca || 0);
        break;
      case 'mover':
        atributoUsado = jogador.atributos.velocidade || 0;
        break;
      case 'defender':
        atributoUsado = (jogador.atributos.reflexo || 0) + (jogador.atributos.defesa || 0);
        break;
      default:
        return message.reply('❌ Ação inválida! Use: chutar, driblar, marcar, mover ou defender.');
    }

    const resultado = dado + atributoUsado;

    const embed = new EmbedBuilder()
      .setTitle('⚽ Ação Livre')
      .setDescription(`${jogador.nome} realizou **${acao}** livremente.`)
      .addFields(
        { name: 'Dado (1d20)', value: `${dado}`, inline: true },
        { name: 'Atributo', value: `${atributoUsado}`, inline: true },
        { name: 'Resultado Total', value: `**${resultado}**`, inline: false }
      )
      .setColor('#0099ff');

    message.channel.send({ embeds: [embed] });
  }
};
