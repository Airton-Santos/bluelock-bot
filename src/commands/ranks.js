const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ranks",
  description: "Mostra o ranking completo dos times (A–Z).",

  async execute(message) {
    try {
      const timesPath = path.join(__dirname, "../data/times.json");

      // Verifica se o arquivo existe
      if (!fs.existsSync(timesPath)) {
        return message.reply("⚠️ Nenhum time foi formado ainda! Use `!FT` para formar os times.");
      }

      // Lê e ordena os times por pontuação
      const times = JSON.parse(fs.readFileSync(timesPath, "utf-8"));
      const ranking = Object.values(times).sort((a, b) => b.pontuacao - a.pontuacao);

      // Emojis de medalha para o top 3
      const medalhas = ["🥇", "🥈", "🥉"];

      // Monta o texto do ranking
      const descricao = ranking
        .slice(0, 26) // limita a 26 times (A–Z)
        .map((time, i) => {
          const posicao = i + 1;
          const icone = medalhas[posicao - 1] || `#${posicao}º`;
          return `${icone} **${time.nome}** — 🏅 ${time.pontuacao} pts`;
        })
        .join("\n");

      // Cria o embed
      const embed = new EmbedBuilder()
        .setColor("#FFD700")
        .setTitle("🏆 Ranking Oficial dos Times (A–Z)")
        .setDescription(descricao)
        .setFooter({ text: "Ranking atualizado conforme a pontuação muda." })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await message.reply("❌ Erro ao exibir o ranking dos times.");
    }
  },
};
