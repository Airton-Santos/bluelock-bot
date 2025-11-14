const fs = require("fs");
const path = require("path");
const Player = require("../models/player");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "setartime",
  description: "Substitui os NPCs do time Z pelos players mencionados. Uso: !timeSet Z @player1 @player2 @player3 @player4",
  
  async execute(message, args) {
    try {
      const timesPath = path.join(__dirname, "../data/times.json");

      if (!fs.existsSync(timesPath)) {
        return message.reply("⚠️ Nenhum time foi formado ainda! Use `!FT` para criar os times.");
      }

      const times = JSON.parse(fs.readFileSync(timesPath, "utf-8"));

      const letra = args[0]?.toUpperCase();
      if (letra !== "Z") {
        return message.reply("❌ Apenas o time Z pode ser substituído nesta função.");
      }

      const mentions = message.mentions.users;
      if (mentions.size !== 5) {
        return message.reply("❌ Você precisa mencionar exatamente 5 jogadores para formar o time.");
      }

      const jogadores = [];
      for (const [_, user] of mentions) {
        const player = await Player.findOne({ discordId: user.id });
        if (!player) {
          return message.reply(`❌ O jogador ${user.username} não possui personagem criado!`);
        }

        jogadores.push({
          nome: player.nome,
          posicao: player.posicao || "Meia",
          atributos: player.atributos
        });
      }

      // Substitui os NPCs do time Z pelos players
      times[letra].jogadores = jogadores;

      // Salva o arquivo
      fs.writeFileSync(timesPath, JSON.stringify(times, null, 2));

      const embed = new EmbedBuilder()
        .setColor("#2ecc71")
        .setTitle(`✅ Time ${letra} atualizado!`)
        .setDescription(`O time ${letra} agora possui os jogadores mencionados no lugar dos NPCs.`)
        .addFields(
          { name: "Jogadores", value: jogadores.map(j => j.nome).join("\n") }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      message.reply("❌ Ocorreu um erro ao atualizar o time.");
    }
  }
};
