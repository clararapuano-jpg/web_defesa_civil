import "dotenv/config";

// Mock do pool para evitar carregar o módulo pg durante testes
let pool: any = null;

try {
  const database = require("./config/database");
  pool = database.pool;
} catch (error) {
  // Se pg não estiver disponível, criar um mock
  pool = {
    end: async () => {}
  };
}

afterAll(async () => {
  if (pool && pool.end) {
    await pool.end();
  }
});