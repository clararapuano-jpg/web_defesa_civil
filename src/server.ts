import "dotenv/config";

import app from "./app";

import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor rodando na porta ${PORT}`
  );

});