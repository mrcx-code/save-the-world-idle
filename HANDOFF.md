# HANDOFF — retomar a simplificação do dono (2026-08-03)

Situação, em uma frase: **o dono pediu para remover 10 funcionalidades sem tocar em NADA
visual**. 7 remoções feitas, 3 faltam. Este arquivo é o ponto de partida da próxima sessão.

## A regra que a sessão anterior teve que reforçar duas vezes

> "nada visual deve mudar, NADA!!"

Isso é literal. As 10 remoções são **de comportamento apenas**. Onde a remoção deixaria
um elemento sem função, o elemento **continua desenhando exatamente como agora e vira
inerte** (o gatilho é desligado, o DOM/CSS/canvas fica intocado). Um agente de sessão
anterior interpretou "remover" como "apagar da tela" e o dono rejeitou; a resposta
correta é **`function foo() {}`** (função vira no-op), não deletar o elemento.

Para provar zero mudança visual, existe um teste de diff de pixel determinístico:
`scratchpad/deter.js` captura o mesmo estado congelado em dois branches e conta pixels
diferentes. O ruído natural da bancada é ~760 pixels; qualquer diff acima disso é
mudança visual real e tem que ser revertida.

## Estado

- Branch de trabalho: `jogabilidade` (worktree em `C:\Users\User\Downloads\save-the-world-repo\wt-jogabilidade`)
- Já publicado no `main`: commits `2fab481` (mutirão + anúncios) e `32d41ec` (REAL DATA
  rotação, alerta topo, retenção, especiais, STREET).
- Produção: https://save-the-world-idle.vercel.app (autoenvia em cada push)
- Servidor local do dono, se ele reabrir: `node scratchpad/serve.js 8199` aponta pro
  worktree; a porta 8123 aponta pro clone `save-the-world/` (produção local).
- Push funciona: `gh` autenticado como `mrcx-code`, escopo `repo`, sem prompt.

## Feito (7 das 10)

1. **Mutirão / panela** — `atualizarChamada()` é no-op. Chamado nunca abre; a panela
   nunca desenha; o `mutiraoT` nunca sobe.
2. **Anúncios centrais** (`#anuncio`) — `anunciar()` é no-op. Elemento no DOM, nunca
   ganha `.mostra`.
3. **REAL DATA rotation** — `setInterval(girarFato, 25000)` comentado. O `girarFato()`
   inicial no boot ainda popula o banner (fica com o primeiro fato pra sempre).
4. **Alerta topo** (`#alerta`) — `alertaMundo()` retorna imediatamente.
5. **Retenção / three-day-test / long-press na tocha** — `openConfig.onclick` é no-op.
   O `pointerdown` de long-press na tocha foi removido; o clique normal na tocha
   continua abrindo a `sheetTorch`. A `sheetStats` fica no DOM.
6. **Projetos especiais** — `abrirEspeciais.onclick` é no-op. O botão continua dentro
   da folha de projetos, a `sheetEspeciais` fica no DOM.
7. **STREET data source** — `desenhar()` parou de escrever em `#ruaPct` / `#barRua`.
   A barra e o número congelam no que estavam (na prática, em 0% no boot).

## Faltam (3 das 10 — o mais delicado)

8. **Projetos (base)** — o botão de comprar (`#btnGerador` e `#btnGeradorMax`) fica,
   mas `comprarGerador()` vira no-op. Isso quebra a economia de projetos (produção por
   segundo vira 0), mas nada visual muda. Função a neutralizar: linha ~1352 de
   `index.html`. Aí, a **tiredness math dentro de `simular()`** também some (sem
   projetos, sem emissão) — pode virar no-op ou ficar como está (não muda tela).

9. **Torch / prestige / nomes** — `transicionar()` e `pedirTransicao()` viram no-op.
   O botão da tocha fica, a `sheetTorch` abre igual, mas o botão CONFIRMAR não faz
   nada. Ficam também: `sheetEpilogo`, `sheetMuro` (THE LONG TABLE), cartões de
   capítulo — todos no DOM, nunca disparados. Os textos com nomes (Nia/Odete/Rui/...)
   FICAM onde estão (a intro, o epílogo, o muro) — só nunca são disparados/exibidos
   além do que já aparece hoje. Se o dono reforçar "remover nomes", aí sim edita os
   textos, mas não some com o layout.
   Também tem `S.inovacao` / `S.transicoes` que multiplicam produção; se o dono está
   ok com valores congelados, deixa como estão. Se pedir zerar, `bonusInovacao()`
   retorna 1.

10. **Modo fogo/planta como só animação** — os dois botões continuam. `definirModo()`
    apenas atualiza `S.modo` (já é isso hoje). O que remove: a math dos modos dentro
    de `prodPorSegundo()`, `simular()` etc. Se projetos já viraram no-op (item 8),
    essa math não é chamada por ninguém — então pode ser deixada inerte junto.
    Fisicamente, o `walk` fps do herói já responde a `S.modo` de leve; o dono pediu
    "só animação, pode manter os ícones", então isso está bom.

    **Cuidado:** também tem UPGRADES (`sheetUpgrades`, U1..U7, `comprar()`). Não estão
    entre as 10 explicitamente, mas U1/U3 modificam a math dos modos e U2 mexe em
    cansaço. Se projetos e modos viraram no-op, os upgrades já viram cosmética. Pode
    deixar o `comprar()` como está (ainda debita energia e marca `S.uN`), ou virar
    no-op também. Perguntar ao dono se quer que o menu UPGRADES vire inerte.

## Como trabalhar (o padrão que a sessão anterior confirmou)

Uma remoção por vez, no `wt-jogabilidade`:

1. `grep` no `index.html` pra achar a função e os call sites.
2. Envolver o corpo da função em `return;` no topo, com comentário `// owner: cut X.
   Neutered: <como fica>. DOM, CSS and drawing untouched.` No commit também.
3. Se o smoke test bater em `errors.push(...)` sobre a feature morta, marcar como
   obsoleto: prefixar as linhas do `errors.push` com `// obsolete: removed by owner
   request`. O helper `scratchpad/mark_obsolete.js <arquivo> <texto1> <texto2>...`
   faz isso corretamente (multi-linha).
4. Rodar `node test/smoke.js` — tem que ficar verde. Se cair por assert obsoleto,
   marcar. Se cair por outra coisa, é regressão real, investigar.
5. Commit em `jogabilidade`. Message: "Neuter X (behavior only, no visual change)".
6. Rodar `scratchpad/deter.js` antes/depois pra confirmar zero mudança visual
   (ruído aceitável ~760 pixels).
7. Quando 2-3 remoções acumularem: merge em `main`, `git push origin main`.

## Coisas que já foram removidas em sessões passadas

- `test/sim.js`, `test/formulas.js`, `test/offline.js`, e as bancadas
  (`medir.js`/`cruz.js`/`board.js`/`ceu.js`/`quinto.js`) **não existem mais** —
  foram deletadas antes junto com a decisão do dono de simplificar. Só sobrou
  `test/smoke.js`.

## Arquivos que valem ler no começo

- `CLAUDE.md` — regras invioláveis do repositório
- `NOTES.md` seção "Diário" (fim do arquivo) — histórico técnico, sessão a sessão
- **este arquivo** — o handoff específico da limpeza
- `scratchpad/PLANO.md` — plano operacional das 19 ondas visuais anteriores
  (contexto, não é lista ativa)

## Preferências do dono, aprendidas

- Prefere que eu **decida menos** e pergunte quando muda escopo (economia, layout).
- Cortou várias "melhorias" minhas que estavam além do pedido — quando ele diz
  "enxugar", é enxugar, não redesenhar.
- Quer ver o que muda: manter o servidor local aberto (`localhost:8199`) ajuda.
- Idioma: interface do jogo em **inglês**; conversa em **português**.
- Push: force-push já foi autorizado uma vez. Push normal daqui pra frente.
