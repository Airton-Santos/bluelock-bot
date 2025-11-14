const { EmbedBuilder } = require("discord.js");
const Player = require("../models/player");
const fluxos = require("../data/fluxo");

module.exports = {
  name: "setfluxo",
  description: "Define um fluxo para um jogador. Uso: !setfluxo @player NomeDoFluxo",
  async execute(message, args) {
    const mestreId = "465303026400231434"; // ID do mestre
    if (message.author.id !== mestreId)
      return message.reply("❌ Apenas o mestre pode usar este comando.");

    const membro = message.mentions.users.first();
    if (!membro)
      return message.reply("❌ Você precisa mencionar o jogador. Ex: `!setfluxo @jogador Tempestade`");

    const fluxoNome = args.slice(1).join(" ");
    if (!fluxoNome)
      return message.reply("❌ Você precisa informar o nome do fluxo. Ex: `!setfluxo @jogador Tempestade`");

    // Verifica se o fluxo existe
    const fluxo = fluxos.find(f => f.nome.toLowerCase() === fluxoNome.toLowerCase());
    if (!fluxo)
      return message.reply("❌ Esse fluxo não existe. Verifique o nome digitado.");

    // Busca o jogador
    const player = await Player.findOne({ discordId: membro.id });
    if (!player)
      return message.reply("❌ Este jogador não possui um personagem criado.");

    // Define fluxo e maestria padrão
    player.fluxoAtivo = fluxo.nome;
    player.fluxoMaestria = 1;

    await player.save();

    // Embed de confirmação
    const embed = new EmbedBuilder()
      .setTitle("🌪️ Fluxo Definido")
      .setDescription(
        `O jogador **${player.nome}** agora possui o fluxo **${fluxo.nome}** com **Maestria Lv.1**.\n\n` +
        `🌀 *${fluxo.descricao}*`
      )
      .setColor("Aqua")
      .setFooter({ text: "Blue Lock RPG - Sistema de Fluxos" });

    message.channel.send({ embeds: [embed] });
  },
};
