const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Player = require("../models/player");

module.exports = {
  name: "dividas",
  description: "Mostra suas dívidas e permite pagamento",
  async execute(message) {
    const player = await Player.findOne({ discordId: message.author.id });
    if (!player) return message.reply("❌ Você não possui personagem.");

    if (!player.dividas || player.dividas.length === 0) {
      return message.reply("✅ Você não possui dívidas no momento.");
    }

    const totalDividas = player.dividas.reduce((acc, d) => acc + d.valor, 0);

    const embed = new EmbedBuilder()
      .setTitle("💳 Suas Dívidas")
      .setDescription(player.dividas.map(d => `${d.descricao}: ${d.valor}¥`).join("\n"))
      .addFields({ name: "Total", value: `${totalDividas}¥`, inline: true })
      .setColor("Orange");

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId("pagar_maos").setLabel("💵 Pagar com Dinheiro").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("pagar_conta").setLabel("🏦 Pagar via Conta").setStyle(ButtonStyle.Secondary)
      );

    const msg = await message.reply({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async i => {
      await i.deferUpdate();

      if (i.customId === "pagar_maos") {
        if (player.dinheiroEmMaos < totalDividas) return i.followUp({ content: "❌ Saldo insuficiente em mãos.", ephemeral: true });
        player.dinheiroEmMaos -= totalDividas;
      } else if (i.customId === "pagar_conta") {
        if (player.banco.saldo < totalDividas) return i.followUp({ content: "❌ Saldo insuficiente na conta.", ephemeral: true });
        player.banco.saldo -= totalDividas;
      }

      player.dividas = [];
      await player.save();

      i.followUp({ content: `✅ Dívidas pagas com sucesso!`, ephemeral: true });
      msg.edit({ components: [] });
    });

    collector.on("end", () => msg.edit({ components: [] }));
  }
};
