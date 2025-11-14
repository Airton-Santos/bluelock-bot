require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const connectDB = require("./database");
const fs = require("fs");
const path = require("path");

// conecta ao MongoDB
connectDB();

// cria client do Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// prefixo
const prefix = "!";

// carrega comandos
client.commands = new Map();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// evento quando o bot fica online
client.once("clientReady", () => {
  console.log(`✅ Bot logado como ${client.user.tag}`);
});

// evento quando uma mensagem é enviada
client.on("messageCreate", async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("❌ Erro ao executar o comando!");
  }
});

// login no Discord
client.login(process.env.DISCORD_TOKEN);
