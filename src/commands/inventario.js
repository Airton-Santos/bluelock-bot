const { EmbedBuilder } = require("discord.js");
const Player = require("../models/player");

module.exports = {
  name: "inventario",
  description: "Mostra o inventário do jogador.",
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;

    const player = await Player.findOne({ discordId: user.id });
    if (!player) return message.reply("❌ Esse jogador ainda não possui uma conta!");

    const embed = new EmbedBuilder()
      .setTitle(`🎒 Inventário de ${player.nome}`)
      .setColor("Blue")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `ID do jogador: ${user.id}` })
      .setTimestamp();

    if (player.inventario.length === 0) {
      embed.setDescription("📭 Seu inventário está vazio!");
    } else {
      const itensFormatados = player.inventario
        .map((item, i) => `**${i + 1}.** ${item.nome} ×${item.quantidade}`)
        .join("\n");

      embed.setDescription(itensFormatados);
    }

    embed.addFields(
      {
        name: "💰 Dinheiro em mãos",
        value: `${player.dinheiroEmMaos}¥`,
        inline: true,
      },
      {
        name: "🏦 Conta bancária",
        value: `${player.banco.saldo}¥`,
        inline: true,
      },
      {
        name: "🍗 Fome",
        value: `${player.fome}/100`,
        inline: true,
      }
    );

    message.channel.send({ embeds: [embed] });
  },
};
