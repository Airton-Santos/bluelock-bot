const Player = require("../models/player");
const lojas = require("../data/lojas");

module.exports = {
  name: "comer",
  description: "Come um alimento do inventário",

  async execute(message, args) {
    const user = message.author;
    const player = await Player.findOne({ discordId: user.id });
    if (!player) return message.reply("❌ Você não possui um personagem!");

    const itemNome = args.join(" ");
    if (!itemNome) return message.reply("❌ Escreva o nome do alimento que deseja comer.");

    // Procura o item no inventário
    const invItem = player.inventario.find(i => i.nome.toLowerCase() === itemNome.toLowerCase());
    if (!invItem) return message.reply("❌ Você não tem esse item no inventário!");

    // Procura o item na loja de comidas (para ver o valor de fome que recupera)
    const comida = lojas.comida.find(c => c.nome.toLowerCase() === itemNome.toLowerCase());
    if (!comida) return message.reply("❌ Esse item não é comestível.");

    // Recupera fome
    const fomeAntes = player.fome;
    player.fome = Math.min(100, player.fome + comida.fome);

    // Remove 1 unidade do item do inventário
    if (invItem.quantidade > 1) invItem.quantidade -= 1;
    else player.inventario = player.inventario.filter(i => i.nome !== invItem.nome);

    await player.save();

    const fomeGanha = player.fome - fomeAntes;

    message.reply(
      `🍽️ Você comeu **${comida.nome}** e recuperou **${fomeGanha}** de fome!\n` +
      `Agora está com **${player.fome}/100** de fome.`
    );
  }
};
