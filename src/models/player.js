const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  nome: { type: String, required: true },
  idade: { type: Number, required: true },
  pais: { type: String, required: true },
  altura: { type: Number, required: true },
  peso: { type: Number, required: true },
  posicao: { type: String, required: true, enum: ["Atacante", "Goleiro", "Ala", "Zagueiro", "Meio-campo"] },
  numero: { type: Number, required: true },
  arma: { type: String, default: null },
  fluxoAtivo: { type: String, default: null },
  fluxoMaestria: { type: Number, default: 0 },
  atributos: { 
    stamina: { type: Number, default: 100 }, 
    velocidade: { type: Number, default: 5 }, 
    drible: { type: Number, default: 5 }, 
    chute: { type: Number, default: 5 }, 
    passe: { type: Number, default: 5 }, 
    defesa: { type: Number, default: 5 }, 
    marcacao: { type: Number, default: 5 }, 
    agilidade: { type: Number, default: 5 }, 
    equilibrio: { type: Number, default: 5 }, 
    reflexo: { type: Number, default: 5 }, 
    precisao: { type: Number, default: 5 } 
  },
  // inventário
  inventario: [{
  nome: String,
  quantidade: { type: Number, default: 1 }
  }],
  treinoAtivo: { type: Boolean, default: false },
  treinoInicio: { type: Date, default: null },
  treinoEtapa: { type: Number, default: 0 },
  treinoEscolhas: { type: [String], default: [] },
  ultimaAtualizacaoFome: { type: Date, default: Date.now },

  // 💵 Banco
  banco: {
    saldo: { type: Number, default: 0 }, // dinheiro na conta
    credito: { type: Number, default: 0 }, // dívida do cartão
    limiteCredito: { type: Number, default: 1000 },
    historico: [String],
  },
  dinheiroEmMaos: { type: Number, default: 0 }, // dinheiro físico
  dividas: [{ descricao: String, valor: Number }], // dívidas gerais
  faturaCartao: { type: Number, default: 0 }, // fatura do cartão

  // 🏠 Casa
  casa: {
    tipo: { type: String, default: "normal" },      // normal, média, luxo
    residencia: { type: String, default: "alugada" } // alugada ou comprada
  },
  
  fome: { type: Number, default: 100 },
});

module.exports = mongoose.model("player", playerSchema);
