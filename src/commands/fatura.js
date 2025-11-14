const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Player = require("../models/player");

module.exports = {
  name: "fatura",
  description: "Mostra a fatura do cartão e permite pagamento",
  async execute(message) {
    const player = await Player.findOne({ discordId: message.author.id });
    if (!player) return message.reply("❌ Você não possui personagem.");

    if (!player.faturaCartao || player.faturaCartao === 0) {
      return message.reply("✅ Você não possui fatura pendente no cartão.");
    }

    const embed = new EmbedBuilder()
      .setTitle("💳 Fatura do Cartão")
      .setDescription(`Valor: ${player.faturaCartao}¥`)
      .setColor("Purple");

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
        if (player.dinheiroEmMaos < player.faturaCartao) return i.followUp({ content: "❌ Saldo insuficiente em mãos.", ephemeral: true });
        player.dinheiroEmMaos -= player.faturaCartao;
      } else if (i.customId === "pagar_conta") {
        if (player.banco.saldo < player.faturaCartao) return i.followUp({ content: "❌ Saldo insuficiente na conta.", ephemeral: true });
        player.banco.saldo -= player.faturaCartao;
      }

      player.faturaCartao = 0;
      await player.save();

      i.followUp({ content: `✅ Fatura do cartão paga com sucesso!`, ephemeral: true });
      msg.edit({ components: [] });
    });

    collector.on("end", () => msg.edit({ components: [] }));
  }
};
