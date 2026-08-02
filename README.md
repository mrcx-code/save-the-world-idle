# SAVE THE WORLD — protótipo idle (teste de 3 dias)

Jogo idle/ação em **um único arquivo**: `index.html`. Sem build, sem dependências, sem servidor.
Abra o arquivo no navegador e está rodando.

O herói corre por um mundo quebrado em 2026. Cada toque é ajuda; cada projeto é gente
trabalhando junto. O mundo cura na tela conforme o impacto total sobe.

## Rodar

```bash
# só abrir no navegador
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows

# ou servir (recomendado no celular, pra testar em rede local)
python3 -m http.server 8000
npx --yes serve .          # se não houver python na máquina
```

## Testar

```bash
npm install -D playwright && npx playwright install chromium
node test/smoke.js
```

O teste roda headless num viewport de celular (390×844) e falha se: houver erro de
console, o segurar-para-atacar não repetir, algum upgrade não aplicar, o terceiro
golpe não pular, o baque não gerar onda de choque, o toque longo não abrir o painel de
retenção, aparecer qualquer diálogo do navegador, ou o ganho offline voltar a usar a
taxa congelada. Ele também mede FPS e salva prints (`shot-*.png`) para inspeção visual.

Além do smoke, dois medidores sem navegador — só as fórmulas em Node, lendo o `CFG`
direto do `index.html` para não divergirem:

```bash
node test/sim.js --detail        # tempo até 50 mil por estratégia
node test/sim.js --patch=u2Sempre  # e sob uma mudança de balanço candidata
node test/offline.js             # o que a noite paga, taxa congelada × integrada
```

## Publicar

Qualquer host estático serve. Na Vercel: importar este repositório e publicar —
sem framework, sem build command, output = raiz.

## Estrutura

| arquivo | o que é |
|---|---|
| `index.html` | o jogo inteiro: HTML, CSS, canvas e lógica |
| `CLAUDE.md` | instruções permanentes: regras invioláveis, ciclo de trabalho, fila |
| `NOTES.md` | fórmulas, balanço medido, dúvidas em aberto e o diário de sessões |
| `test/smoke.js` | teste de fumaça headless (Playwright) |
| `test/formulas.js` | a economia em Node, com o `CFG` lido do `index.html` |
| `test/sim.js` | tempo até 50 mil por estratégia, e sob patches candidatos |
| `test/offline.js` | quanto a noite paga: taxa congelada × integrada |

## Regras do projeto

1. **Números reais nunca entram nas fórmulas.** Os dados do banner `REAL DATA` vivem
   no array `dadosReais`, cada um com `fonte` e `data`. Sem fonte verificável, o número
   não entra. Os números do jogo (`CFG`) existem só para o jogo ser divertido e não
   representam nada do mundo real.
2. **Sem empresas ou políticos reais como vilões.** Os inimigos são abstrações:
   fumaça, tambor tóxico, saco de dinheiro.
3. **Mobile primeiro.** Sem zoom, sem seleção de texto, sem cara de site.

## O loop

Toque (ou **segure**) para ajudar → junte impacto → abra projetos (custo 15×1,15ⁿ) →
escolha o ritmo: **GO FAST** rende 3/s por projeto mas cansa o time, **GO STEADY**
começa em 1/s e sobe até 2/s em 120s sem cansar. Cansaço corrói *toda* a produção
(saúde do time = 100/(100+cansaço)). Aos 50 mil de impacto total dá para **passar a
tocha**: recomeça tudo e ganha Sabedoria permanente (+10% cada), e quanto mais
descansado o time, mais Sabedoria.

Sete upgrades: campanhas grandes, ajuda mútua, treino do time, vizinhos que ajudam
sozinhos, ferramentas para todos, divisão justa dos ganhos e dias de descanso.

## Combo

Toques encadeiam três golpes: corte horizontal, corte ascendente e um **salto com
baque no chão** que abre uma onda de choque. Segurar o botão mantém o herói golpeando.
