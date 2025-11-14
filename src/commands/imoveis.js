const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const Player = require("../models/player");
const imoveis = require("../data/imoveis");

module.exports = {
  name: "imoveis",
  description: "Mostra a loja de imóveis para comprar ou alugar casas",
  async execute(message) {
    const user = message.author;
    const player = await Player.findOne({ discordId: user.id });

    if (!player) return message.reply("❌ Você não possui personagem!");

    const embed = new EmbedBuilder()
      .setTitle("🏠 Loja de Imóveis")
      .setDescription("Escolha um imóvel para **comprar** ou **alugar**")
      .setColor("Green")
      .addFields(
        imoveis.map(imovel => ({
          name: imovel.nome,
          value: `💰 Compra: ${imovel.precoCompra}¥\n📄 Aluguel: ${imovel.precoAluguel}¥ / semana`
        }))
      );

    const select = new StringSelectMenuBuilder()
      .setCustomId("selecionar_imovel")
      .setPlaceholder("Selecione um imóvel")
      .addOptions(
        imoveis.map(imovel => ({
          label: imovel.nome,
          description: `Compra: ${imovel.precoCompra}¥ | Aluguel: ${imovel.precoAluguel}¥`,
          value: imovel.nome
        }))
      );

    const row = new ActionRowBuilder().addComponents(select);
    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === user.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async i => {
      if (i.customId === "selecionar_imovel") {
        const escolhido = imoveis.find(imv => imv.nome === i.values[0]);
        await i.deferUpdate();

        // opções de compra ou aluguel
        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("compra_" + escolhido.nome).setLabel("🛒 Comprar").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("alugar_" + escolhido.nome).setLabel("📄 Alugar").setStyle(ButtonStyle.Primary)
        );

        return i.followUp({ content: `Você selecionou **${escolhido.nome}**. Deseja comprar ou alugar?`, components: [row2], ephemeral: true });
      }

      // verifica se é compra ou aluguel
      const isCompra = i.customId.startsWith("compra_");
      const isAluguel = i.customId.startsWith("alugar_");
      const nomeImovel = i.customId.replace("compra_", "").replace("alugar_", "");
      const escolhido = imoveis.find(imv => imv.nome === nomeImovel);

      if (!escolhido) return i.followUp({ content: "❌ Imóvel não encontrado.", ephemeral: true });

      await i.deferUpdate();

      const preco = isCompra ? escolhido.precoCompra : escolhido.precoAluguel;

      // escolher método de pagamento
      const rowPag = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("maos_" + nomeImovel + "_" + (isCompra ? "compra" : "aluguel")).setLabel("💵 Dinheiro em mãos").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("conta_" + nomeImovel + "_" + (isCompra ? "compra" : "aluguel")).setLabel("🏦 Conta (débito)").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("credito_" + nomeImovel + "_" + (isCompra ? "compra" : "aluguel")).setLabel("💳 Cartão de crédito").setStyle(ButtonStyle.Danger)
      );

      return i.followUp({
        content: `💰 O valor é **${preco}¥**.\nEscolha a forma de pagamento:`,
        components: [rowPag],
        ephemeral: true
      });
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });

    // pagamento
    message.client.on("interactionCreate", async interaction => {
      if (!interaction.isButton()) return;
      if (interaction.user.id !== user.id) return;

      const [metodo, nomeImovel, tipoOperacao] = interaction.customId.split("_");
      const escolhido = imoveis.find(imv => imv.nome === nomeImovel);
      if (!escolhido) return;

      const preco = tipoOperacao === "compra" ? escolhido.precoCompra : escolhido.precoAluguel;

      // 💵 Dinheiro em mãos
      if (metodo === "maos") {
        if (player.dinheiroEmMaos < preco)
          return interaction.reply({ content: "❌ Você não tem dinheiro suficiente em mãos!", ephemeral: true });

        player.dinheiroEmMaos -= preco;
      }

      // 🏦 Débito em conta
      if (metodo === "conta") {
        if (player.banco.saldo < preco)
          return interaction.reply({ content: "❌ Saldo insuficiente na conta!", ephemeral: true });

        player.banco.saldo -= preco;
      }

      // 💳 Crédito
      if (metodo === "credito") {
        if (player.banco.credito + preco > player.banco.limiteCredito)
          return interaction.reply({ content: "❌ Limite do cartão estourado!", ephemeral: true });

        player.banco.credito += preco;
        player.faturaCartao += preco;
      }

      // atualizar casa
      player.casa.tipo = escolhido.tipo;
      player.casa.residencia = tipoOperacao === "compra" ? "comprada" : "alugada";
      await player.save();

      await interaction.reply({
        content: `✅ Você agora mora em **${escolhido.nome}** (${tipoOperacao === "compra" ? "casa própria" : "alugada"})!`,
        ephemeral: true
      });
    });
  }
};
