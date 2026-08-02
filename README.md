# SAVE THE WORLD

> *nobody is saved alone*

Um jogo idle de ação para celular. O mundo de 2026 está parado — e você é quem começa
de novo.

Você corre por uma rua quebrada com uma varinha na mão. Cada toque lança magia. Cada
projeto que você abre é gente trabalhando junto. E o mundo **cura na sua frente
enquanto você corre**: o céu volta a ter cor, as janelas acendem, os ipês florescem, a
água limpa, as cozinhas comunitárias aparecem na calçada.

Não tem tela de vitória. Tem uma rua que melhora porque você apareceu.

---

## A decisão que o jogo inteiro é sobre

Você escolhe o ritmo, e não existe resposta certa:

**🔥 GO FAST** — o triplo da produção agora. E o time cansa.
**🌱 GO STEADY** — começa devagar e vai subindo. E ninguém se esgota.

O cansaço do time divide **tudo**: produção, toques, o que você leva ao passar a tocha.
Forçar a barra funciona por um minuto e cobra pelo resto da partida. Ir firme demora a
engrenar e não cobra nada.

O jogo te mostra a conta na hora de decidir — o que você ganha agora, no que aquilo
estabiliza, e onde o seu time vai parar. A escolha continua sua.

## O que anda pela rua

Os inimigos não são pessoas nem empresas. São abstrações do que trava o mundo:

| | |
|---|---|
| **fumaça** | o ar de quem não pôde escolher |
| **tambor** | o que enterraram e foram embora |
| **saco de dinheiro** | valor que parou de circular — estoura em **SHARED!** |

Eles caminham até você e ficam parados no caminho, atrapalhando o trabalho, até alguém
resolver. Derrubar um deixa algo no chão que precisa ser recolhido — ou os vizinhos
recolhem por você, se você tiver ajudado eles antes.

## A comunidade

De tempos em tempos a panela chama e há uma janela curta pra aparecer. Quem aparece
dispara um **mutirão**: todo mundo rende mais, e a rua limpa o caminho.

Voltar amanhã vale mais que jogar demais hoje. Cada dia distinto deixa a rua um pouco
melhor pra sempre, e quem volta depois de uma noite encontra um chamado guardado.

## Passar a tocha

Chega uma hora em que você já não é mais quem a rua precisa que aprenda — você é quem
ensina. Passar a tocha zera tudo o que você construiu e guarda pra sempre o que você
aprendeu.

Você não vai embora. Você senta.

---

## Rodar

O jogo inteiro é **um arquivo**. Sem build, sem framework, sem dependência de rede.
Abrir no navegador é rodar.

```bash
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux
```

Pra testar no celular na rede local, sirva a pasta com qualquer servidor estático
(`npx --yes serve .` resolve).

## Testar

```bash
npm install -D playwright && npx playwright install chromium
node test/smoke.js
```

O smoke test roda headless num viewport de celular (390×844), mede FPS e salva prints
(`shot-*.png`). Ele falha se houver erro de console, se o segurar-pra-atacar parar de
repetir, se um upgrade não aplicar, se o terceiro golpe não pular, se o baque não gerar
onda de choque, se o toque na cena não golpear, se aparecer qualquer diálogo do
navegador, ou se o ganho offline voltar a usar taxa congelada. **Sempre olhe os
prints** — o teste garante que não quebrou, não que ficou bonito.

Dois medidores sem navegador, só as fórmulas em Node, lendo o `CFG` direto do
`index.html` pra não divergirem:

```bash
node test/sim.js --detail   # tempo até a tocha, por estratégia
node test/offline.js        # o que a noite paga
```

## Regras do projeto

1. **Números reais nunca entram nas fórmulas.** Dados do mundo real vivem só no banner
   `REAL DATA`, cada um com fonte e data. Sem fonte verificável, o número não entra. Os
   números do jogo existem para o jogo ser divertido e não representam nada.
2. **Nenhuma empresa, marca ou político real como vilão.** Os inimigos são abstrações.
3. **Solidário sem ser panfletário.** Se ficar com cara de palanque, foi longe demais.
4. **Mobile primeiro.** Sem zoom, sem seleção de texto, sem cara de site.
5. **Um arquivo só.** Nada de bundler, nada de CDN, nada de asset externo.

`CLAUDE.md` tem as instruções permanentes de quem trabalha no repositório, e `NOTES.md`
tem as fórmulas, o balanço medido e o diário de sessões.
