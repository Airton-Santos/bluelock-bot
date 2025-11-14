const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const npcsPath = path.join(__dirname, "../data/npcs.js");
let npcsExistentes = require(npcsPath);
if (!Array.isArray(npcsExistentes)) npcsExistentes = [];

const nomesJaponeses = [
  "Riku","Haru","Souta","Ren","Tsubasa","Kaito","Minato","Naoki","Daichi","Takumi",
  "Aoi","Yuto","Kazuma","Rento","Ryo","Sora","Keisuke","Hariki","Toru","Kenta",
  "Itsuki","Makoto","Akira","Shinji","Hikaru","Taiga","Ryusei","Eiji","Rei","Yuma",
  "Arata","Daigo","Hayato","Jun","Kazuya","Koji","Masato","Nobu","Rin","Shun",
  "Tomo","Yoshi","Yuji","Asahi","Genji","Haruki","Isamu","Jiro","Kenshin","Masaki",
  "Renji","Satoru","Takeshi","Toshi","Wataru","Yuuto","Haruya","Daigo","Ryoji","Kenji",
  "Tora","Yori","Atsu","Kyo","Nori","Reo","Hajime","Riki","Tadashi","Shiro",
  "Kaoru","Masaru","Ritsu","Rui","Soshi","Yora","Itsuro","Hideo","Minoru","Shin",
  "Kenta","Haruzuki","Soka","Reni","Rikoneta","Takaba","Hoshi","Taku","Aoizi","Torashi", 
  "Krato","Kraven","Zento","Yamato","Karak","Kurapika","Kazuki","Gon","Koda","Inosuke", 
  "Tanjiro","Zenitsu","Toraka","Ranmaru","Sasuke","Itachi","Kakashi","Shikamaru","Neji","Lee","Gaara",
  "Shoyo","Hinara","Kageyama","Tobio","Sugawara","Nishinoya","Tanaka","Yamaguchi",
  "Arashi","Daizen","Hiroto","Kairi","Natsuo","Renma","Seiji","Taichi","Yoru","Akihiko",
  "Ryota","Takeru","Noboru","Eita","Sho","Kyoji","Manato","Rihito","Kaen","Haruma","Rito","Kakashi"
];

const posicoes = ["Atacante", "Meia", "Zagueiro", "Ala", "Goleiro"];

module.exports = {
  name: "npcsgenerate",
  description: "Gera NPCs com distribuição equilibrada entre as posições",
  async execute(message, args) {
    const maxStatus = parseInt(args[0]);
    const quantidade = parseInt(args[1]) || 1;

    if (!maxStatus || maxStatus < 1)
      return message.reply("❌ Use corretamente: `!npcsgenerate [máximo dos status] [quantidade]`");

    if (maxStatus > 20)
      return message.reply("⚠️ O máximo permitido é **20**.");

    const nomesUsados = npcsExistentes.map(n => n.nome);
    const nomesDisponiveis = nomesJaponeses.filter(n => !nomesUsados.includes(n));

    if (nomesDisponiveis.length < quantidade)
      return message.reply(`⚠️ Existem apenas **${nomesDisponiveis.length} nomes disponíveis**.`);

    const gerar = () => Math.floor(Math.random() * maxStatus) + 1;

    const novosNPCs = [];

    // 🔹 Garante exatamente 'quantidade' NPCs
    for (let i = 0; i < quantidade; i++) {
      const nome = nomesDisponiveis.splice(Math.floor(Math.random() * nomesDisponiveis.length), 1)[0];
      const posicao = posicoes[i % posicoes.length]; // distribui ciclicamente: A, M, Z, A, G, A, M...

      const npc = {
        nome,
        posicao,
        atributos: {
          stamina: 100,
          velocidade: gerar(),
          drible: gerar(),
          chute: gerar(),
          passe: gerar(),
          defesa: gerar(),
          marcacao: gerar(),
          agilidade: gerar(),
          equilibrio: gerar(),
          reflexo: gerar(),
          precisao: gerar()
        }
      };

      npcsExistentes.push(npc);
      novosNPCs.push(npc);
    }

    // 🔹 Salvar arquivo
    const arquivoConteudo = "module.exports = " + JSON.stringify(npcsExistentes, null, 4) + ";";
    fs.writeFileSync(npcsPath, arquivoConteudo, "utf8");

    // 🔹 Contagem por posição
    const contagem = {};
    for (const p of posicoes) contagem[p] = novosNPCs.filter(n => n.posicao === p).length;

    const resumo = Object.entries(contagem)
      .map(([pos, qtd]) => `**${pos}:** ${qtd}`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle(`✅ ${novosNPCs.length} NPC(s) Gerado(s) e Salvo(s)`)
      .setDescription(`📊 **Status máximo:** ${maxStatus}\n📦 **Total:** ${quantidade}\n\n**Distribuição por posição:**\n${resumo}`)
      .setFooter({ text: "NPCs criados com atributos equilibrados (stamina fixa em 100)" })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};
