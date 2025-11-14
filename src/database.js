const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI.replace("<DB_NAME>", "BluelockRPG"), {
      dbName: "BluelockRPG" // define explicitamente o banco de dados
    });
    console.log("✅ Conectado ao MongoDB!");
  } catch (err) {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
  }
};

module.exports = connectDB;
