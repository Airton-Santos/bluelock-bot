const { EmbedBuilder } = require("discord.js");
const lojas = require("../data/lojas");

module.exports = {
  name: "loja",
  description: "Mostra a lista de lojas ou os itens de uma loja específica",
  async execute(message, args) {
    const tipoLoja = args[0]?.toLowerCase();

    // Se não passar tipo, mostrar a lista de lojas
    if (!tipoLoja) {
      const embed = new EmbedBuilder()
        .setTitle("🏬 Lojas Disponíveis")
        .setDescription("Digite `!loja <tipo>` para ver os itens disponíveis.\n\nTipos disponíveis:")
        .addFields(
          Object.keys(lojas).map(l => ({ name: l.charAt(0).toUpperCase() + l.slice(1), value: "⠀" }))
        )
        .setColor("Blue");

      return message.reply({ embeds: [embed] });
    }

    // Se o tipo não existir
    if (!lojas[tipoLoja]) return message.reply("❌ Loja inválida. Use `!loja` para ver os tipos disponíveis.");

    // Mostrar os itens da loja
    const embed = new EmbedBuilder()
      .setTitle(`🛒 Loja de ${tipoLoja.charAt(0).toUpperCase() + tipoLoja.slice(1)}`)
      .setColor("Green")
      .setDescription(lojas[tipoLoja].map(item => `${item.nome} - ${item.preco}¥`).join("\n"));

    message.reply({ embeds: [embed] });
  }
};
