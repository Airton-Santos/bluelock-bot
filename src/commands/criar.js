const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Player = require("../models/player"); // seu model do MongoDB
const armas = require("../data/armas");

module.exports = {
  name: "criar",
  description: "Cria seu personagem Blue Lock",
  async execute(message, args) {
    const user = message.author;

    const exists = await Player.findOne({ discordId: user.id });
    if (exists) return message.reply("❌ Você já tem um personagem criado!");

    const filter = m => m.author.id === user.id && m.content.startsWith("!");
    const perguntas = [
      { label: "Nome do personagem", key: "nome", validate: (v) => /^[A-Za-z\s]{2,20}$/.test(v) },
      { label: "Idade", key: "idade", validate: (v) => !isNaN(v) && v >= 10 && v <= 50 },
      { label: "País", key: "pais", validate: (v) => v.length > 1 },
      { label: "Altura em cm", key: "altura", validate: (v) => !isNaN(v) && v > 50 },
      { label: "Peso em kg", key: "peso", validate: (v) => !isNaN(v) && v > 20 },
      { label: "Posição (Atacante, Goleiro, Ala, Zagueiro, Meio-campo)", key: "posicao", validate: (v) => ["Atacante", "Goleiro", "Ala", "Zagueiro", "Meio-campo"].includes(v) },
      { label: "Número da camisa", key: "numero", validate: (v) => !isNaN(v) && v > 0 }
    ];

    const respostas = {};

    for (const pergunta of perguntas) {
      const embed = new EmbedBuilder()
        .setTitle("Criação de Personagem")
        .setDescription(`${pergunta.label}\nDigite sua resposta com **!resposta**`)
        .setColor("Blue");

      await message.channel.send({ embeds: [embed] });

      try {
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
        let resposta = collected.first().content.slice(1).trim(); // remove "!"
        if (!pergunta.validate(resposta)) {
          return message.reply(`❌ Resposta inválida para: ${pergunta.label}`);
        }
        respostas[pergunta.key] = resposta;
      } catch {
        return message.reply("⏰ Tempo esgotado! Tente criar o personagem novamente.");
      }
    }

    // roletar arma
    const roletarArma = async () => {
      const armasDisponiveis = armas.filter(a => !a.estaEmUso);
      if (armasDisponiveis.length === 0) return null;

      let primeira = armasDisponiveis[Math.floor(Math.random() * armasDisponiveis.length)];
      let segunda = primeira;
      while (segunda === primeira) {
        segunda = armasDisponiveis[Math.floor(Math.random() * armasDisponiveis.length)];
      }

      const embed = new EmbedBuilder()
        .setTitle("Roleta de Armas")
        .setDescription("Você rolou duas armas! Escolha qual ficará com você.")
        .addFields(
          { name: "Opção 1", value: primeira.nome },
          { name: "Opção 2", value: segunda.nome }
        )
        .setColor("Green");

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder().setCustomId("1").setLabel("Escolher Opção 1").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("2").setLabel("Escolher Opção 2").setStyle(ButtonStyle.Secondary)
        );

      const msg = await message.channel.send({ embeds: [embed], components: [row] });

      const buttonFilter = i => i.user.id === user.id;
      try {
        const buttonInteraction = await msg.awaitMessageComponent({ filter: buttonFilter, time: 60000 });
        await buttonInteraction.deferUpdate();
        return buttonInteraction.customId === "1" ? primeira : segunda;
      } catch {
        return primeira;
      }
    };

    const armaEscolhida = await roletarArma();

    // gerar tipo de casa aleatoriamente
    const tipoResidencia = Math.random() < 0.5 ? "alugada" : "comprada";


    // salvar player
   const novo = new Player({
        discordId: user.id,
        nome: respostas.nome,
        idade: parseInt(respostas.idade),
        pais: respostas.pais,
        altura: parseInt(respostas.altura),
        peso: parseInt(respostas.peso),
        posicao: respostas.posicao,
        numero: parseInt(respostas.numero),
        arma: armaEscolhida.nome, // só o nome
        inventario: [], // começa vazio
        treinoAtivo: false,
        treinoEtapa: 0,
        treinoInicio: null,
        treinoEscolhas: [],
        casa: {
          tipo: "normal",         // casa normal sempre
          residencia: tipoResidencia // "alugada" ou "comprada"
        },
        dinheiroEmMaos: 1000
    });

    await novo.save();
    armaEscolhida.estaEmUso = true;

    const embedFinal = new EmbedBuilder()
      .setTitle("✅ Personagem Criado!")
      .setDescription(`Seu personagem **${novo.nome}** (#${novo.numero}) foi criado com sucesso!`)
      .addFields(
        { name: "Arma Escolhida", value: armaEscolhida.nome }
      )
      .setColor("Gold");

    message.channel.send({ embeds: [embedFinal] });
  }
};
