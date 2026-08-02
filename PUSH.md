# Como subir isso pro GitHub (uma vez só)

O repositório já está pronto aqui dentro: `git init` feito, tudo commitado na branch `main`.
Só falta apontar pro GitHub e empurrar.

## 1. Criar o repositório vazio

Vá em <https://github.com/new>:

- **Repository name:** `save-the-world-idle`
- **Public** (ou private, tanto faz)
- **NÃO** marque "Add a README", "Add .gitignore" nem "Choose a license" — tem que
  nascer vazio, senão dá conflito no primeiro push.

Clique em *Create repository*.

## 2. Empurrar

No terminal, dentro desta pasta:

```bash
git remote add origin https://github.com/mrcx-code/save-the-world-idle.git
git push -u origin main
```

Se pedir senha, use um **Personal Access Token** (github.com → Settings → Developer
settings → Personal access tokens → Fine-grained → escopo `Contents: read and write`
nesse repositório). Ou instale o [GitHub CLI](https://cli.github.com) e rode
`gh auth login` uma vez — aí o push funciona sem pedir nada.

## 3. Ligar na Vercel (deploy automático)

O projeto que fica é o **save-the-world-idle**. O `transicao-energetica-idle` some.

1. Vercel → projeto `save-the-world-idle` → *Settings → Git → Connect Git Repository*
   → escolha `mrcx-code/save-the-world-idle`.
   (Se preferir começar limpo: apague os dois e importe do zero em
   <https://vercel.com/new>, com o nome `save-the-world-idle`.)
   - Framework Preset: **Other**
   - Build Command: vazio
   - Output Directory: vazio (raiz)
2. Apague o `transicao-energetica-idle`: *Settings → General → rolar até o fim →
   Delete Project*.

A partir daí, todo `git push` publica sozinho. Não precisa mais de deploy manual.

> ⚠️ O link curto **da.gd/pC1Qb** aponta pro projeto antigo e vai morrer junto com ele.
> A URL nova vai ser `save-the-world-idle-mrcx.vercel.app` — me avise que eu gero um
> link curto novo.

## Trabalhando de outro PC

```bash
git clone https://github.com/mrcx-code/save-the-world-idle.git
cd save-the-world-idle
# abra index.html no navegador — é só isso, não tem build
```

Para rodar o teste antes de subir alteração:

```bash
npm install -D playwright && npx playwright install chromium
node test/smoke.js
```
