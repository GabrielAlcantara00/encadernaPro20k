/* ============================================================
   CONFIGURAÇÃO DA LP  ·  edite só este arquivo
   ============================================================ */
window.LP_CONFIG = {
  brand: "Papeleira Pro 20K",

  /* Links de checkout. Cole o link de cada oferta entre as aspas. */
  basic:   { price: 10, checkout: "https://ggcheckout.app/checkout/v5/mf7JINDqHjH4RusRscjM9n" }, // Plano Básico
  premium: { price: 37, checkout: "https://ggcheckout.app/checkout/v5/dD6fwvV7qEd6AUkqVOuVCo" }, // Plano Premium (preço da página)
  upgrade: { price: 27, checkout: "https://ggcheckout.app/checkout/v5/m8teMITsnJDpvXSBb8QuFH" }, // Premium com desconto: popup do Básico e roleta de saída

  /* Preço "de" que aparece riscado */
  anchor: { basic: 97, premium: 197 },

  /* Rastreamento */
  pixelId: "",   // ID do Pixel da Meta. Deixe "" para não carregar o pixel.
  utmify: true,  // script de UTMs da UTMify (o mesmo da LP dos bottons)

  /* Suporte (aparece no rodapé, nos Termos e na Privacidade) */
  supportEmail: "", // ex.: "suporte@seudominio.com.br"
  whatsapp: "",     // só números, com DDI e DDD. Ex.: "5511999999999"

  guaranteeDays: 30
};
