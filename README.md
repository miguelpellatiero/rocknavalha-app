# Barbearia Rock & Navalha

Site + app instalável (PWA) com agenda no Supabase e painel do barbeiro.

## Colocar no ar (GitHub Pages)
1. Crie o repositório e envie esta pasta (veja os comandos abaixo).
2. Settings > Pages > Source: `main` / `(root)`.
3. Site: https://miguelpellatiero.github.io/barbearia-rocknavalha/

```
git init && git add . && git commit -m "Site Rock & Navalha"
git branch -M main
git remote add origin https://github.com/miguelpellatiero/barbearia-rocknavalha.git
git push -u origin main
```

## Supabase (agenda, preços, painel)
1. Crie um projeto em supabase.com e rode `supabase/schema.sql` no SQL Editor.
2. Authentication: crie o usuário do barbeiro e desative "Allow new users to sign up".
3. Rode o `insert into admins ...` que está no final do `schema.sql` (com o e-mail dele).
4. Cole a URL e a chave PÚBLICA (anon/publishable) em `assets/js/config.js`. Nunca use a `service_role`.
5. Painel: `/admin.html`.

## Música
Coloque 4 arquivos em `assets/audio/` (`musica-1.mp3` ... `musica-4.mp3`), livres de direitos autorais. A cada visita toca a próxima faixa. Sem os arquivos, o botão ♫ some.

## Antes de divulgar
- Preencha o nome do responsável em `privacidade.html`.
- Confira horários e pacote no painel.
- Cadastre o site no Google Search Console e envie `sitemap.xml`.
- Sem domínio próprio, `robots.txt` e `sitemap.xml` na pasta do projeto não são lidos pelo Google; com domínio próprio (ou repositório `usuario.github.io`) passam a valer.
