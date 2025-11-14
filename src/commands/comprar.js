const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Player = require("../models/player");
const lojas = require("../data/lojas");

module.exports = {
  name: "comprar",
  description: "Comprar itens nas lojas",
  async execute(message, args) {
    const tipoLoja = args[0]?.toLowerCase();
    const nomeItem = args.slice(1).join(" ");

    if (!tipoLoja || !nomeItem) return message.reply("❌ Use: !comprar <loja> <nome do item>");

    if (!lojas[tipoLoja]) return message.reply("❌ Loja inválida.");

    const item = lojas[tipoLoja].find(i => i.nome.toLowerCase() === nomeItem.toLowerCase());
    if (!item) return message.reply("❌ Item não encontrado na loja.");

    const player = await Player.findOne({ discordId: message.author.id });
    if (!player) return message.reply("❌ Você não possui personagem.");

    // Embed com opções de pagamento
    const embed = new EmbedBuilder()
      .setTitle(`💳 Comprar ${item.nome}`)
      .setDescription(`Preço: ${item.preco}¥\nEscolha o método de pagamento:`)
      .setColor("Green");

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId("dinheiro_maos").setLabel("💵 Dinheiro em mãos").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("debito_conta").setLabel("🏦 Débito na conta").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("cartao_credito").setLabel("💳 Cartão de crédito").setStyle(ButtonStyle.Success)
      );

    const msg = await message.reply({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async i => {
      await i.deferUpdate();

      if (i.customId === "dinheiro_maos") {
        if (player.dinheiroEmMaos < item.preco) return i.followUp({ content: "❌ Saldo insuficiente em mãos.", ephemeral: true });
        player.dinheiroEmMaos -= item.preco;
      } else if (i.customId === "debito_conta") {
        if (player.banco.saldo < item.preco) return i.followUp({ content: "❌ Saldo insuficiente na conta.", ephemeral: true });
        player.banco.saldo -= item.preco;
      } else if (i.customId === "cartao_credito") {
        if (player.banco.credito + item.preco > player.banco.limiteCredito) return i.followUp({ content: "❌ Limite do cartão estourado.", ephemeral: true });
        player.banco.credito += item.preco;
        player.faturaCartao += item.preco;
      }

      // Adicionar item no inventário
      const invItem = player.inventario.find(it => it.nome === item.nome);
      if (invItem) invItem.quantidade += 1;
      else player.inventario.push({ nome: item.nome, quantidade: 1 });

      await player.save();
      i.followUp({ content: `✅ Você comprou **${item.nome}**!`, ephemeral: true });
      msg.edit({ components: [] });
    });

    collector.on("end", () => msg.edit({ components: [] }));
  }
};
