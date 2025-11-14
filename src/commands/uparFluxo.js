const { EmbedBuilder } = require("discord.js");
const Player = require("../models/player");
const fluxos = require("../data/fluxo");
const cenas = require("../data/fluxosCenas");

module.exports = {
  name: "uparfluxo",
  description: "Aumenta o nível de maestria do fluxo de um jogador. Uso: !uparFluxo @player",
  async execute(message, args) {
    const mestreId = "465303026400231434"; // 🔥 seu ID de mestre
    if (message.author.id !== mestreId) {
      return message.reply("❌ Apenas o mestre pode usar este comando.");
    }

    const membro = message.mentions.users.first();
    if (!membro) return message.reply("❌ Você precisa mencionar o jogador a ser upado.");

    const player = await Player.findOne({ discordId: membro.id });
    if (!player) return message.reply("❌ Esse jogador não possui um personagem criado.");

    if (!player.fluxoAtivo) {
      return message.reply("⚠️ Esse jogador ainda não possui um fluxo definido. Use `!setFluxo` primeiro.");
    }

    // nível atual do fluxo
    if (!player.fluxoNivel) player.fluxoNivel = 1;

    if (player.fluxoNivel >= 2) {
      return message.reply("⚡ Esse jogador já atingiu o nível máximo de maestria no fluxo!");
    }

    // pega o fluxo e seus dados
    const fluxo = fluxos.find(f => f.nome.toLowerCase() === player.fluxoAtivo.toLowerCase());
    if (!fluxo) return message.reply("❌ O fluxo salvo no jogador não existe mais nos dados.");

    // sobe o nível do fluxo
    player.fluxoNivel = 2;
    await player.save();

    // narrativa personalizada
    const tipoPrincipal = fluxo.bonus.toLowerCase();
    const narrativa = cenas[tipoPrincipal]
      ? cenas[tipoPrincipal].replaceAll("{nome}", player.nome)
      : `🔥 **${player.nome}** sente sua alma em combustão — seu Flow evolui além dos limites!`;

    // Embed cinematográfico
    const embed = new EmbedBuilder()
      .setTitle(`💥 Maestria Desperta: ${fluxo.nome}`)
      .setDescription(narrativa)
      .setColor("Red")
      .addFields(
        { name: "🔥 Novo Nível", value: "Maestria **Lv.2**", inline: true },
        { name: "⭐ Foco do Fluxo", value: fluxo.bonus, inline: true }
      )
      .setFooter({ text: "Blue Lock RPG - Despertar do Flow" })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};
