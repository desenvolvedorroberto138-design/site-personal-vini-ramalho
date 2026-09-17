# Plano de Reestruturação: site-personal-vini-ramalho

## Objetivo

Reestruturar o site de um monolito inline (1216 linhas em `public/index.html`) para uma arquitetura modular e escalável, **mantendo Firebase Hosting e o domínio `viniramalho2025.web.app`** para hospedagem, e **migrando para Supabase** como banco de dados, autenticação e armazenamento de imagens.

## Decisões-Chave

| # | Decisão | Justificativa |
|---|---|---|
| 1 | **Vite como build tool** | O usuário solicitou npm + `@supabase/supabase-js`. Vite é o bundler padrão moderno, lida com ES modules, minificação e code-splitting. Firebase Hosted só serve arquivos estáticos, então um passo de build é necessário. |
| 2 | **`public/` = source root, `dist/` = output** | Respeita a estrutura solicitada pelo usuário. `firebase.json` aponta para `dist/`. |
| 3 | **Supabase anon key em `.env`** | O anon key é projetado para ser público (segurança via RLS). Variáveis Vite usam prefixo `VITE_`. |
| 4 | **Admin = client-side auth + Supabase RLS** | Sem server-side rendering. Adequado para o escopo (site institucional). |
| 5 | **Conteúdo migrado** | Textos, testemunhos e planos existentes em `index.html` são reutilizados, distribuídos pelas novas páginas. |

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Hospedagem | Firebase Hosting (mantido) |
| DB / Auth / Storage | Supabase |
| Build Tool | Vite (ESBuild interno) |
| CSS | Tailwind CSS (via CDN → build local com `@tailwindcss/vite`) |
| Ícones | Font Awesome 6 (CDN) |
| Deploy | `npm run build` → `firebase deploy` |

## Estrutura Final de Pastas

```
site-personal-vini-ramalho/
├── .kilo/                              (plano + futuros comandos/agentes)
├── .gitignore                          (inclui node_modules/)
├── firebase.json                       (atualizado: public → "dist", headers)
├── .firebaserc                         (mantido)
├── package.json                        (NOVO - dependências npm)
├── vite.config.js                      (NOVO - configuração build)
├── tailwind.config.js                  (NOVO - purge de classes)
├── postcss.config.js                   (NOVO)
├── .env                                (NOVO - Supabase URL + anon key)
├── .env.example                        (NOVO - template de credenciais)
├── public/                             (source root)
│   ├── index.html
│   ├── sobre.html
│   ├── planos.html
│   ├── resultados.html
│   ├── contato.html
│   ├── pagamento.html
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── google9cf969bcc529d5ea.html
│   ├── assets/
│   │   └── img/
│   │       ├── hero/                   (fotos hero - 5-7 imagens selecionadas)
│   │       ├── antes-depois/           (7 imagens existentes)
│   │       ├── icones/                 (PWA icons, favicon, logo)
│   │       └── sobre/                  (foto do Vini)
│   ├── css/
│   │   ├── base/
│   │   │   ├── variaveis.css           → paleta de cores, fontes, espaçamentos
│   │   ├── componentes/
│   │   │   ├── header.css
│   │   │   ├── hero.css
│   │   │   ├── botoes.css
│   │   │   ├── footer.css
│   │   │   ├── slider-antes-depois.css
│   │   ├── paginas/
│   │   │   ├── home.css
│   │   │   ├── sobre.css
│   │   │   ├── planos.css
│   │   │   ├── resultados.css
│   │   │   ├── contato.css
│   │   └── admin/
│   │       ├── login.css
│   │       ├── dashboard.css
│   │       └── editor.css
│   ├── js/
│   │   ├── main.js                     → funções gerais (smooth scroll, etc.)
│   │   ├── menu-mobile.js
│   │   ├── slider-comparacao.js
│   │   ├── formulario-contato.js
│   │   ├── calculadora-imc.js
│   │   └── supabase/
│   │       ├── cliente.js              → init Supabase (URL + anon key)
│   │       ├── auth.js                 → login/logout/verificação admin
│   │       ├── galeria.js              → CRUD fotos antes/depois
│   │       ├── mensagens.js            → CRUD mensagens de contato
│   │       └── upload-imagens.js       → upload para Supabase Storage
│   └── admin/
│       ├── login.html
│       ├── dashboard.html
│       ├── galeria.html
│       ├── conteudo.html
│       └── mensagens.html
├── dist/                               (gerado - NÃO versionado)
└── AGENTS.md                           (NOVO - comandos de desenvolvimento)
```

## Ordered Task List

### Fase 1: Tooling & Configuração de Build

1. **`package.json`** — inicializar npm, instalar dependências:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview",
       "deploy": "npm run build && firebase deploy"
     },
     "dependencies": {
       "@supabase/supabase-js": "^2.45.0"
     },
     "devDependencies": {
       "vite": "^5.4.0"
     }
   }
   ```

2. **`vite.config.js`** — configurar `root: 'public'`, `outDir: '../dist'`, `publicDir: 'assets'`, entrypoints múltiplos para todas as páginas públicas e admin.

3. **`tailwind.config.js` + `postcss.config.js`** — migrar Tailwind do CDN para build local. Configurar `content` para pegar classes de todos os HTMLs.

4. **`.env` / `.env.example`** — credenciais Supabase:
   ```
   VITE_SUPABASE_URL=https://XXXX.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzUx...
   ```

5. **`.gitignore`** — adicionar `node_modules/`, `dist/`, `.env`.

6. **`firebase.json`** — atualizar `public` de `"public"` para `"dist"`. Adicionar headers de segurança (CSP, X-Frame-Options, etc.). Manter rewrites para SPA.

7. **`AGENTS.md`** — documentar comandos (`npm install`, `npm run dev`, `npm run build`, `npm run deploy`).

### Fase 2: Supabase — Database Setup (manual pelo usuário)

8. Criar projeto Supabase em [supabase.com](https://supabase.com) (região: São Paulo).

9. SQL no editor para criar tabelas (ver schema completo abaixo).

10. Habilitar **RLS** e criar políticas (ver abaixo).

11. Criar **bucket público** `imagens` em Storage.

12. Criar **usuário admin** em Authentication → Users (e-mail/senha).

### Fase 3: CSS Modular

13. **`css/base/variaveis.css`** — definir paleta de cores (orange-500, gray-800, etc.), fontes, spacing scale.

14. **`css/componentes/{header,hero,botoes,footer,slider-antes-depois}.css`** — extrair estilos do CSS inline atual.

15. **`css/paginas/{home,sobre,planos,resultados,contato}.css`** — estilos específicos por página.

16. **`css/admin/{login,dashboard,editor}.css`** — estilos do painel admin.

### Fase 4: JS Modular

17. **`js/supabase/cliente.js`** — `createClient()` com credenciais do `.env`.

18. **`js/supabase/galeria.js`** — `carregarGaleria()`, `enviarFoto(antes, depois, titulo)`, `excluirFoto(id)`.

19. **`js/supabase/mensagens.js`** — `salvarMensagem(dados)`, `listarMensagens()`, `marcarComoLida(id)`.

20. **`js/supabase/auth.js`** — `login(email, senha)`, `logout()`, `verificarAutenticacao()`.

21. **`js/supabase/upload-imagens.js`** — `uploadImagem(file, pasta)` usando Supabase Storage.

22. **`js/{main,menu-mobile,slider-comparacao,formulario-contato,calculadora-imc}.js`** — migrar JS inline do index.html atual.

### Fase 5: Páginas Públicas

23. **`public/index.html`** — homepage (hero slideshow, sobre, planos destaque, chamada IMC). Linka CSS modular + JS modular. Usa Tailwind classes.

24. **`public/sobre.html`** — página sobre o Vini.

25. **`public/planos.html`** — página de planos de treinamento.

26. **`public/resultados.html`** — galeria antes/depois carregada do Supabase, com slider interativo.

27. **`public/contato.html`** — formulário de contato que salva no Supabase + abre WhatsApp.

28. **`public/pagamento.html`** — página de pagamento (mantida do original).

29. **`public/robots.txt`** + **`public/sitemap.xml`** — atualizados com novas URLs.

### Fase 6: Painel Admin

30. **`public/admin/login.html`** — formulário de login (e-mail/senha) usando Supabase Auth.

31. **`public/admin/dashboard.html`** — contadores de fotos, mensagens não lidas, status do site.

32. **`public/admin/galeria.html`** — lista fotos do Supabase, botão upload (antes+depois), exclusão.

33. **`public/admin/conteudo.html`** — editar textos via `configuracao` table (hero title, sobre, etc.).

34. **`public/admin/mensagens.html`** — lista mensagens, marcar como lida, deletar.

35. **`js/supabase/auth.js`** + proteção: redirecionar para `login.html` se não autenticado.

### Fase 7: Migração e Mídia

36. **Migrar imagens** — reorganizar `public/assets/image/` → `public/assets/img/{hero,before_After → antes-depois,icones,sobre}`.

37. **Selecionar 5-7 hero images** — reduzir de 20 para o essencial. Comprimir todos os JPEGs para ~150-300KB.

38. **Migrar conteúdo textual** — textos do index.html atual para as novas páginas.

### Fase 8: Testes & Deploy

39. **Teste local**: `npm install && npm run dev` → validar todas as páginas, galeria dinâmica, formulário.

40. **Build de produção**: `npm run build` → validar `dist/`.

41. **Deploy**: `npm run deploy` → validar domínio `viniramalho2025.web.app`.

42. **Configurar redirects**: adicionar `localhost` às URLs de redirecionamento autorizadas do Supabase Auth.

## Schema SQL (Supabase)

```sql
-- Galeria de antes/depois
CREATE TABLE galeria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  url_antes TEXT NOT NULL,
  url_depois TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Mensagens de contato
CREATE TABLE mensagens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  mensagem TEXT,
  lida BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Configurações dinâmicas do site
CREATE TABLE configuracao (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);

-- Valores iniciais
INSERT INTO configuracao (chave, valor) VALUES
  ('hero_titulo',    'Transforme seu corpo e sua saúde'),
  ('hero_subtitulo', 'Com treinos personalizados e acompanhamento profissional do Personal Trainer Vini Ramalho.'),
  ('sobre_texto_1',  'Com mais de 6 anos de experiência no mercado fitness, Vini Ramalho é especialista em transformações corporais.'),
  ('sobre_texto_2',  'Formando em Educação Física e com diversas especializações, Vini desenvolve treinos personalizados.'),
  ('telefone_wpp',   '5511930137185');
```

## RLS Policies

```sql
ALTER TABLE galeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao ENABLE ROW LEVEL SECURITY;

-- Público pode ler galeria e configuração
CREATE POLICY "Public read galeria"    ON galeria       FOR SELECT USING (true);
CREATE POLICY "Public read configuracao" ON configuracao FOR SELECT USING (true);
CREATE POLICY "Public insert mensagens" ON mensagens    FOR INSERT WITH CHECK (true);

-- Usuários autenticados gerenciam tudo
CREATE POLICY "Admin manage galeria"     ON galeria       FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin manage mensagens"   ON mensagens     FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin manage configuracao" ON configuracao FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
```

## Bucket de Storage

- **Nome**: `imagens`
- **Visibilidade**: Público (public)
- **Estrutura de pastas**: `galeria/`, `hero/`
- **URLs públicas**: `https://XXXX.supabase.co/storage/v1/object/public/imagens/galeria/...`

## firebase.json Atualizado

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          { "key": "Cache-Control", "value": "max-age=31536000" }
        ]
      },
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-XSS-Protection", "value": "1; mode=block" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" }
        ]
      }
    ]
  }
}
```

## Riscos & Considerações

| Risco | Mitigação |
|---|---|
| **Supabase anon key exposta** | É por design — RLS policies protegem os dados. Chave nunca deve ser usada para operações sensíveis. |
| **Admin page acessível via HTML** | Protegido via client-side redirect + Supabase RLS rejeita queries não autenticadas. |
| **Imagens pesadas** | Usar WebP, lazy loading, limitar 5-7 hero images. |
| **Build step adicionado** | Documentar comandos no AGENTS.md. `npm run dev` para desenvolvimento, `npm run deploy` para produção. |
| **Variáveis de ambiente no deploy** | Vite injeta `VITE_*` no build. Usuário preenche `.env` antes de buildar. |
| **Domínio mantido** | Firebase Hosting configuration permanece. `firebase.json` aponta para `dist/` ao invés de `public/`. |

## Passo a Passo de Uso (pós-implementação)

### 1. Instalação
```bash
npm install
```

### 2. Configurar Supabase
- Acessar [supabase.com](https://supabase.com) → criar projeto (região São Paulo)
- Copiar URL e anon key de `Project Settings → API`
- Colar no `.env` (usar `.env.example` como template)

### 3. Setup do banco
- No Supabase Studio → SQL Editor → colar e executar o schema SQL acima

### 4. Criar usuário admin
- Supabase Studio → Authentication → Users → Add User
- Marcar como `confirmed` e `email_confirmed`
- Adicionar à tabela `profiles` se needed (opcional)

### 5. Criar bucket de Storage
- Supabase Studio → Storage → New Bucket → nome: `imagens` → `public: true`

### 6. Adicionar URL de redirecionamento
- Supabase Studio → Project Settings → Authentication → URL Configuration
- Adicionar `http://localhost:3000/admin/*` e `https://viniramalho2025.web.app/admin/*`

### 7. Desenvolvimento local
```bash
npm run dev
# → http://localhost:3000
```

### 8. Deploy
```bash
npm run deploy
# → https://viniramalho2025.web.app
```

### 9. Validar pós-deploy
- Site carrega normalmente
- Galeria carrega imagens do Supabase
- Formulário de contato salva mensagem no Supabase
- `/admin/login.html` funciona
- Após login, `/admin/dashboard.html` acessível
- Links "App Store" / "Google Play" têm ícones corretos
