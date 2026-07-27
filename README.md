# Site CETESV — Centro de Ensino Técnico e Superior Vianense

Site institucional estático (HTML, CSS e JavaScript puro) com formulário de vestibular, banner de cookies (LGPD) e SEO otimizado.

## 📁 Estrutura

```
cetesv-site/
├── index.html          Home
├── sobre.html           Sobre Nós (história, missão/visão/valores, localização)
├── cursos.html          Licenciatura em História e Pedagogia + FAQ
├── biblioteca.html      Periódicos e Portal Universitário
├── vestibular.html      Formulário de inscrição (Vestibular 2025.1)
├── privacidade.html     Política de Privacidade (LGPD)
├── termos.html          Termos de Uso
├── css/style.css        Estilos e animações
├── js/main.js           Interações, validação de formulário, consentimento de cookies
├── assets/              Favicons, ícones e fontes auto-hospedadas (assets/fonts/*.woff2)
├── robots.txt
├── sitemap.xml
├── _headers             Cabeçalhos de segurança (Netlify)
└── .htaccess             Cabeçalhos de segurança (Apache)
```

## ⚙️ Configurações pendentes antes de publicar

### 1. Formulário do Vestibular → Formspree
Em `vestibular.html`, troque:
```html
<form ... action="https://formspree.io/f/SEU_ID_AQUI" method="POST">
```
1. Crie uma conta grátis em [formspree.io](https://formspree.io)
2. Cadastre o e-mail que deve receber as inscrições
3. Copie o ID do formulário criado e substitua `SEU_ID_AQUI`
4. Faça um envio de teste — o Formspree pede uma confirmação por e-mail no primeiro envio

### 2. Google Analytics (opcional, já com consentimento LGPD embutido)
Em `js/main.js`, troque:
```js
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
```
pelo ID real da sua propriedade GA4 (Administrador → Fluxos de dados, em [analytics.google.com](https://analytics.google.com)). Ele só carrega depois que o visitante autoriza cookies analíticos no banner.

### 3. Mapa de localização
Em `sobre.html`, o mapa agora só carrega **depois de um clique** (ou automaticamente, se a pessoa já tiver aceitado cookies analíticos), para não chamar o Google sem consentimento. O endereço usado está no atributo `data-map-src` da `<div class="map-consent">`. Para deixar 100% preciso:
1. Encontre o prédio exato no Google Maps
2. Compartilhar → Incorporar um mapa → copie o `src` do iframe
3. Substitua o valor de `data-map-src` (não o `src`, já que o iframe só é criado dinamicamente pelo `js/main.js` após o clique/consentimento)

### 4. Domínio real
Troque `https://www.cetesv.edu.br` pelo domínio real nas tags `canonical`, Open Graph e nos arquivos `robots.txt` / `sitemap.xml`.

### 5. WhatsApp
O botão flutuante usa `https://wa.me/5598900000000` — troque pelo número real da secretaria em todas as páginas (busque por `wa.me`).

## 🔒 Segurança
Os cabeçalhos de segurança (CSP, X-Frame-Options, HSTS etc.) já vêm prontos em `_headers` (Netlify/Vercel) e `.htaccess` (Apache/hospedagem tradicional). Se usar outro provedor (ex. GitHub Pages puro), configure cabeçalhos equivalentes por lá, se disponível — GitHub Pages não permite headers customizados nativamente; considere Netlify, Vercel ou Cloudflare Pages para isso.

## 🍪 LGPD
O banner de cookies e a central de preferências já funcionam sem nenhuma dependência externa (guardam a escolha no navegador do usuário). O texto da Política de Privacidade (`privacidade.html`) já reflete Formspree + Google Analytics como os únicos processadores de dados.

## 🚀 Publicar

**GitHub Pages:** Settings → Pages → Branch `main` → pasta raiz. O site fica em `https://SEU_USUARIO.github.io/SEU_REPO/`.

**Netlify/Vercel:** conecte o repositório e faça o deploy — os arquivos `_headers` (Netlify) já ficam prontos automaticamente.
