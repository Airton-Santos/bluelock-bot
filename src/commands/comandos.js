const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');

module.exports = {
  name: 'comandos',
  description: 'Mostra a lista de comandos disponíveis (Players e Mestres)',
  async execute(message) {
    const playerEmbed = new EmbedBuilder()
      .setTitle('🧑‍🎓 Comandos de Jogadores')
      .setColor('#00BFFF')
      .setDescription('Lista de comandos que os **jogadores** podem usar durante o RPG de Blue Lock.')
      .addFields(
        { name: '!a <ação>', value: 'Executa uma ação em campo. Ex: `!a chutar` ou `!a mover`.', inline: false },
        { name: '!abrirconta', value: 'Cria sua conta bancária no jogo.', inline: false },
        { name: '!banco', value: 'Acessa o menu do banco para ver saldo, transferir, etc.', inline: false },
        { name: '!comer <item>', value: 'Come um alimento do inventário para recuperar energia.', inline: false },
        { name: '!comprar <loja> <item>', value: 'Compra um item em uma loja específica.', inline: false },
        { name: '!criar', value: 'Cria seu personagem com nome, posição e atributos.', inline: false },
        { name: '!dividas', value: 'Mostra suas dívidas atuais (impostos, aluguel etc).', inline: false },
        { name: '!entrar <código> <time>', value: 'Entra em uma partida informando o código e o time (A ou B).', inline: false },
        { name: '!fatura', value: 'Mostra a fatura do cartão e permite pagamento.', inline: false },
        { name: '!imoveis', value: 'Mostra a loja de imóveis disponíveis.', inline: false },
        { name: '!inventario', value: 'Exibe os itens do seu inventário.', inline: false },
        { name: '!loja', value: 'Mostra a lista de lojas disponíveis.', inline: false },
        { name: '!pagar @player <quantia>', value: 'Transfere dinheiro diretamente a outro jogador.', inline: false },
        { name: '!ranks', value: 'Mostra o ranking atual dos jogadores dentro do Blue Lock.', inline: false },
        { name: '!saldo', value: 'Mostra o saldo da sua conta bancária.', inline: false },
        { name: '!semana', value: 'Avança uma semana e cobra impostos automaticamente.', inline: false },
        { name: '!status', value: 'Mostra o status atual do seu personagem.', inline: false },
        { name: '!transferir', value: 'Transfere dinheiro entre contas bancárias.', inline: false },
        { name: '!treinar', value: 'Treina seus atributos e melhora suas habilidades.', inline: false },
      );

    const mestreEmbed = new EmbedBuilder()
      .setTitle('🎩 Comandos de Mestres')
      .setColor('#FFD700')
      .setDescription('Comandos exclusivos do **Mestre do Jogo** para controlar partidas e jogadores.')
      .addFields(
        { name: '!ap <npc> <ação>', value: 'Executa uma ação com um NPC. Ex: `!ap bruno chutar`.', inline: false },
        { name: '!buff <nome>', value: 'Aplica um buff especial em um jogador.', inline: false },
        { name: '!encerar <código>', value: 'Encerra uma partida ativa.', inline: false },
        { name: '!flow on/off @player', value: 'Ativa ou desativa o Flow de um jogador.', inline: false },
        { name: '!ft', value: 'Forma os times iniciais.', inline: false },
        { name: '!givemoney @player <quantia>', value: 'Dá dinheiro diretamente a um jogador.', inline: false },
        { name: '!npcsgenerate <status> <quantidade>', value: 'Gera NPCs automaticamente com atributos definidos.', inline: false },
        { name: '!play <código>', value: 'Inicia oficialmente uma partida.', inline: false },
        { name: '!prepararpartida <código>', value: 'Prepara o ambiente da partida antes de começar.', inline: false },
        { name: '!setfluxo @player <Fluxo>', value: 'Define o Flow (fluxo) do jogador.', inline: false },
        { name: '!setartime @player1, @player2...', value: 'Define manualmente o time de jogadores no Blue Lock.', inline: false },
        { name: '!start', value: 'Cria uma nova partida e gera um código.', inline: false },
        { name: '!statuspartida <código>', value: 'Mostra o status atual de uma partida (ações, tempo, etc).', inline: false },
        { name: '!uparfluxo @player', value: 'Aumenta a maestria do Flow de um jogador.', inline: false },
        { name: '!npcsver', value: 'Mostra os NPCs gerados por posição.', inline: false }
      );

    const pages = [playerEmbed, mestreEmbed];
    let currentPage = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('⬅️ Voltar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('➡️ Próximo')
        .setStyle(ButtonStyle.Primary)
    );

    const msg = await message.channel.send({
      embeds: [pages[currentPage]],
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== message.author.id)
        return i.reply({ content: '❌ Apenas quem usou o comando pode trocar de página.', ephemeral: true });

      if (i.customId === 'prev') {
        currentPage = currentPage === 0 ? pages.length - 1 : currentPage - 1;
      } else if (i.customId === 'next') {
        currentPage = (currentPage + 1) % pages.length;
      }

      await i.update({ embeds: [pages[currentPage]], components: [row] });
    });

    collector.on('end', () => {
      msg.edit({ components: [] });
    });
  },
};
