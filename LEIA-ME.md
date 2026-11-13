# LP Papeleira Pro 20K

## 1. Antes de subir, edite `config.js`

- `basic.checkout`: link do checkout do Básico (R$ 10).
- `premium.checkout`: link do Premium (R$ 37).
- `upgrade.checkout`: link do Premium com desconto (R$ 27). É o mesmo link no popup do Básico e na roleta.
- `pixelId`: ID do Pixel da Meta. Vale usar um pixel separado do Bottons.
- `supportEmail` e `whatsapp`: aparecem no rodapé, nos Termos e na Privacidade.
- `brand`: nome do produto. Troca na página toda, menos no título da aba (`<title>` do `index.html`).

Enquanto um link de checkout estiver vazio, o botão daquele plano mostra o aviso "Falta colar o link de checkout".

## 2. Subir no GitHub e na Vercel

1. No GitHub, crie um repositório novo (pode ser privado).
2. Clique em **Add file → Upload files** e arraste tudo o que está **dentro** desta pasta.
3. Na Vercel, clique em **Add New → Project**, importe o repositório, deixe o Framework Preset em **Other**, sem comando de build, e clique em **Deploy**.

## 3. Como testar

- `?roleta=1` no fim do endereço abre a roleta.
- `?popup=1` abre o popup do Básico.
- A roleta aparece uma vez por sessão e não aparece depois que a pessoa clica em comprar. Para ver de novo, use uma aba anônima.
- No computador, a roleta abre quando o mouse sai pelo topo da janela. No celular, quando a pessoa rola para cima rápido no começo da página, depois de 9 segundos (mesma regra da LP dos bottons).
- As UTMs da URL (utm_source, utm_medium, utm_campaign, utm_content, utm_term, src, sck, fbclid) vão junto para o checkout.

## 4. Confira antes de anunciar

A página promete: 20.347 arquivos, +1.180 no Premium, 34 categorias, app com filtro e foto de cada coleção, entrega em até 2 minutos no e-mail e no WhatsApp, coleções novas todo mês em 2027, suporte prioritário, os 5 bônus e a liberação para vender as agendas impressas. Se algo for diferente do que você entrega, ajuste no `index.html`.

## Arquivos

- `index.html`: a página
- `config.js`: preços, links, pixel e suporte
- `assets/styles.css`: visual
- `assets/app.js`: popup, roleta, calculadora, pixel e UTMs
- `termos.html` e `privacidade.html`: páginas legais
- `favicon.svg` e `vercel.json`
