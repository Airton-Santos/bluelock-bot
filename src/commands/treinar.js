const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Player = require("../models/player");

const TREINO_DURACAO = 5 * 60 * 1000; // 5 minutos por etapa
const ETAPAS = 5;

// Opções de treino por etapa (atributo oculto)
const TREINOS = [
  [
    { label: "Corrida leve", atributo: "velocidade" },
    { label: "Alongamento", atributo: "drible" },
    { label: "Saltos e agilidade", atributo: "reflexo" },
  ],
  [
    { label: "Chute ao gol", atributo: "chute" },
    { label: "Drible em cones", atributo: "drible" },
    { label: "Corrida de velocidade", atributo: "velocidade" },
  ],
  [
    { label: "Corrida leve", atributo: "stamina" },
    { label: "Técnicas de finalização", atributo: "chute" },
    { label: "Defesa e reflexos", atributo: "reflexo" },
  ],
  [
    { label: "Treino de passe", atributo: "passe" },
    { label: "Treino de marcação", atributo: "marcacao" },
    { label: "Treino de equilíbrio", atributo: "equilibrio" },
  ],
  [
    { label: "Agilidade e reação", atributo: "agilidade" },
    { label: "Precisão nos chutes", atributo: "precisao" },
    { label: "Defesa e reflexos", atributo: "reflexo" },
  ],
];

module.exports = {
  name: "treinar",
  description: "Inicia o treino ou avança para a próxima etapa com botões",
  async execute(message, args, client) {
    const user = message.author;
    const player = await Player.findOne({ discordId: user.id });

    if (!player) return message.reply("❌ Você não possui um personagem! Crie com `!criar`.");

    // Garantir que treinoEscolhas exista
    if (!player.treinoEscolhas) player.treinoEscolhas = [];

    // Se treino não iniciado, iniciar imediatamente
    if (!player.treinoAtivo || !player.treinoInicio) {
      player.treinoAtivo = true;
      player.treinoEtapa = 1;
      player.treinoInicio = null; // Primeiro treino ainda não começou
      player.treinoEscolhas = [];
      await player.save();
    }

    const etapa = player.treinoEtapa;
    const agora = new Date();

    // Checa tempo somente se treino já começou
    if (player.treinoInicio) {
      const tempoPassado = agora - new Date(player.treinoInicio);
      if (tempoPassado < TREINO_DURACAO) {
        const restante = Math.ceil((TREINO_DURACAO - tempoPassado) / 1000);
        return message.reply(`⏳ Ainda não passou 5 minutos! Faltam ${restante} segundos para avançar.`);
      }
    }

    // Se todas as etapas já foram concluídas
    if (etapa > ETAPAS) {
      return message.reply("⚠️ Você já concluiu todas as etapas do treino. Use `!treinar` para iniciar outro.");
    }

    // Criar embed e botões para escolha da etapa
    const embed = new EmbedBuilder()
      .setTitle(`🏋️ Treino - Etapa ${etapa}/${ETAPAS}`)
      .setDescription("Escolha seu treino desta etapa (atributos ocultos até o final).")
      .setColor("Blue");

    const row = new ActionRowBuilder();
    TREINOS[etapa - 1].forEach((t, i) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`treinar_${etapa}_${i}`)
          .setLabel(t.label)
          .setStyle(ButtonStyle.Primary)
      );
    });

    const treinoMsg = await message.reply({ embeds: [embed], components: [row] });

    // Filtro para capturar apenas o jogador correto
    const filter = i => i.user.id === user.id && i.customId.startsWith(`treinar_${etapa}_`);
    const collector = treinoMsg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async interaction => {
      await interaction.deferUpdate();

      const escolhaIndex = parseInt(interaction.customId.split("_")[2]);
      const escolha = TREINOS[etapa - 1][escolhaIndex];

      // Guardar escolha e avançar etapa
      player.treinoEscolhas.push(escolha.atributo);
      player.treinoEtapa += 1;
      player.treinoInicio = new Date(); // Marca início da próxima etapa
      await player.save();

      if (player.treinoEtapa > ETAPAS) {
        // Aplicar atributos no final
        const contagem = {};
        player.treinoEscolhas.forEach(a => {
          contagem[a] = (contagem[a] || 0) + 1;
        });

        for (const key in contagem) {
          player.atributos[key] += contagem[key];
        }

        // Resetar treino
        player.treinoAtivo = false;
        player.treinoEtapa = 0;
        player.treinoInicio = null;
        player.treinoEscolhas = [];
        await player.save();

        return interaction.followUp({
          content: `🏁 Treino finalizado! Seus atributos aumentaram de forma oculta. 💪`,
          ephemeral: true
        });
      } else {
        interaction.followUp({
          content: `✅ Você completou a etapa ${etapa}. Aguarde 5 minutos para a próxima etapa e use \`!treinar\` novamente.`,
          ephemeral: true
        });
      }
    });

    collector.on("end", collected => {
      if (collected.size === 0) treinoMsg.edit({ content: "⏰ Tempo de escolha esgotado.", components: [] });
    });
  },
};
