/* ============================================================
   CONFIGURAÇÃO DA LP  ·  edite só este arquivo
   ============================================================ */
window.LP_CONFIG = {
  brand: "Papeleira Pro 20K",

  /* Links de checkout. Cole o link de cada oferta entre as aspas. */
  basic:   { price: 10, checkout: "https://vopax.com.br/c/0c25a56c-7f53-4af3-a4be-5d319c598e1f" }, // Plano Básico
  premium: { price: 37, checkout: "https://vopax.com.br/c/74e8a345-6323-47dd-9fe2-556173630936" }, // Plano Premium (preço da página)
  upgrade: { price: 27, checkout: "https://vopax.com.br/c/ee4c55db-5d8b-4b4d-b1bf-12a483fd2339" }, // Premium com desconto: popup do Básico e roleta de saída

  /* Preço "de" que aparece riscado */
  anchor: { basic: 97, premium: 197 },

  /* Rastreamento */
  pixelId: "2348303565735596", // ID do Pixel da Meta (não é segredo).
  // O script da UTMify enviado está embutido diretamente no index.html.

  /* Suporte (aparece no rodapé, nos Termos e na Privacidade) */
  supportEmail: "", // ex.: "suporte@seudominio.com.br"
  whatsapp: "",     // só números, com DDI e DDD. Ex.: "5511999999999"

  guaranteeDays: 30
};
