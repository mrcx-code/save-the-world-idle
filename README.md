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
taxa congelada. Também cobre o mundo tocável: um toque na cena golpear igual ao botão,
segurar a cena repetir, segurar os dois ao mesmo tempo **não** dobrar a cadência, o
toque com folha aberta só fechar, o monstro andar e bloquear produção, o item cair e
ser recolhido no toque, a chamada da comunidade abrir e o mutirão subir a produção, e o
bônus por dia bater com o `CFG`. Ele mede FPS e salva prints (`shot-*.png`) —
**sempre olhe os prints**: o teste garante que não quebrou, não que ficou bom.

Além do smoke, dois medidores sem navegador — só as fórmulas em Node, lendo o `CFG`
direto do `index.html` para não divergirem:

```bash
node test/sim.js --detail        # tempo até 50 mil por estratégia
node test/sim.js --patch=u2Sempre  # e sob uma mudança de balanço candidata
node test/sim.js --ciclos=2      # duas tochas seguidas — onde uma skill permanente aparece
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

## Projetos e skills

A folha de projetos diz o que um projeto **é**, não só quanto custa: quanto os que você já
tem rendem por segundo sozinhos, quanto mais um adicionaria agora (no modo em que você
está, com seus upgrades e a saúde do time), e que o preço sobe 15% a cada compra. A fileira
`×1 / ×10 / MAX` compra em lote — mesma curva, mesmo gasto total, menos toques.

**Skills** são uma categoria à parte: upgrades são desta partida, skills são para sempre.
Folha própria, aberta pela tocha, liberada só depois de você passar a tocha uma vez. A
primeira é **AUTO-FIRE**: a varinha vigia e atira sozinha. Ela não produz nada por conta
própria — queima **FOCO**, e foco só vem de aparecer para o mundo (limpar um problema,
catar um item, atender a chamada). Celular na mesa, varinha muda. E nenhum tiro automático
encosta no cansaço, nunca.

## A troca de ritmo

A folha de projetos mostra o negócio lado a lado — **NOW** contra **SWITCH** — com o que
cada ritmo rende *agora*, no que ele *assenta* depois que o cansaço encontra o equilíbrio,
e para onde a saúde do time vai. Tudo projetado das fórmulas vivas (`cansacoEq`,
`cansacoEm`, `segundosAteSaude`, `taxaSe`), então a explicação não tem como divergir do
jogo. Sair do GO STEADY reseta a rampa, e isso agora é dito em vermelho, com o
multiplicador que se perde. O botão de modo na barra é um estado (`FAST →5%`), não um
ícone que troca.

## O mundo responde

A cena inteira é botão: tocar nela golpeia igual ao CTA de baixo (mesmo combo, mesmo
salto) e ainda acerta o que estiver embaixo do dedo. Com uma folha aberta, o toque só
fecha a folha.

- **Problemas andam.** Fumaça, tambor e saco de dinheiro caminham até você e formam
  fila. Parado na frente, cada um bloqueia 10% da produção até alguém resolver — é
  multiplicador, nunca cansaço, então não muda a conta de GO FAST × GO STEADY.
- **O que cai fica no chão.** Derrubar um deixa um item que precisa ser **recolhido no
  toque**. Os vizinhos (U4) recolhem sozinhos depois de 5s, pela metade.
- **A comunidade chama.** De tempos em tempos a panela pede mãos e há uma janela de
  12s. Aparecer dispara um **mutirão**: ×1,35 em tudo por 20s e a rua limpa o caminho.
  Perder a chamada não custa nada.
- **Voltar amanhã vale.** Cada dia distinto jogado dá +2% permanente (teto de 10 dias),
  e quem volta depois de uma noite — ou num dia novo — encontra uma chamada guardada,
  que vale dobrado.

## Combo

Toques encadeiam três golpes: corte horizontal, corte ascendente e um **salto com
baque no chão** que abre uma onda de choque. Segurar o botão (ou a cena) mantém o herói
golpeando; segurar os dois ao mesmo tempo não acelera nada — a cadência é uma só.
