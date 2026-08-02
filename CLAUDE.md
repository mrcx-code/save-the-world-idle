# CLAUDE.md — instruções permanentes deste repositório

Leia este arquivo, o `NOTES.md` e o `README.md` antes de tocar em qualquer coisa.

## 1. O que é isto

`SAVE THE WORLD` é um protótipo de jogo idle/ação para celular, feito para responder
**uma única pergunta**: *o loop segura um jogador por três dias?* Tudo neste repositório
existe para servir a essa pergunta. Recurso bonito que não ajude a respondê-la é ruído.

O jogo inteiro é **um arquivo**: `index.html`. Sem build, sem framework, sem dependência
em runtime. Abrir o arquivo no navegador é rodar o jogo. Isso é uma decisão de projeto,
não uma limitação — não a desfaça.

Tema: um herói corre por um mundo quebrado em 2026 e o conserta. Meio ambiente e pautas
sociais. A tensão é *forçar a barra e cansar o time* contra *ir firme e organizar*.
O tom é solidário sem ser panfletário: cozinhas comunitárias no cenário, o monstro do
dinheiro que estoura em "SHARED!", "nobody is saved alone" na abertura. Mantenha essa
mão leve — se ficar com cara de palanque, foi longe demais.

## 2. Regras invioláveis

1. **Números reais nunca entram nas fórmulas.** Fatos do mundo real vivem só no array
   `dadosReais`, cada um com `fonte` e `data`, e aparecem só no banner REAL DATA.
   Sem fonte verificável, o número não entra. Os números do jogo (`CFG`) existem para o
   jogo ser divertido e não representam nada do mundo real. Nunca misture os dois.
2. **Nenhuma empresa ou político real como vilão.** Os inimigos são abstrações: fumaça,
   tambor tóxico, saco de dinheiro.
3. **Mobile primeiro.** Sem zoom, sem seleção de texto, sem cara de site. O bloqueio de
   gestos e o `user-select: none` estão lá de propósito.
4. **Um arquivo só.** Nada de separar CSS/JS, nada de bundler, nada de CDN novo.
5. **`main` é produção.** Todo push publica automático na Vercel. Nunca deixe a `main`
   quebrada.

## 3. Estado atual

Loop testado: projeto custa `15 × 1,15^n`. **GO FAST** rende 3/s por projeto (6 com
*Big campaigns*) e cansa o time; **GO STEADY** começa em 1/s e sobe até 2/s em 120s
(4/s e rampa dobrada com *Team training*), sem cansar; trocar de modo zera a rampa.
Cansaço decai em forma fechada (`p = eq + (p − eq)·e^(−kt)`), o que faz a mesma equação
valer para o progresso offline. Saúde do time = `100/(100+cansaço)` multiplica **tudo**,
inclusive toques. Aos 50 mil de impacto total dá pra passar a tocha:
`sabedoria = ⌊√(total/2500) × saúde⌋`, +10% permanente por ponto.

Sete upgrades (tabela completa no `NOTES.md`). Combo de três conjurações terminando em
salto com baque e onda de choque. Segurar o botão principal repete a ~7 golpes/s. Mundo
renderizado a 1 px de mundo = 2 px de tela, **e tudo vive nessa mesma grade** — herói e
monstros já foram desenhados em 2× por cima e isso era o que deixava o jogo com cara de
tosco; hoje são sprites assados em canvas offscreen, sombreados por uma direção de luz só
(sol em cima e à direita).

**Direção de arte: C — CLEAR SKY** (pôster de meio-dia, saturado, contorno duro, **zero
pós-processamento**). O herói não é espadachim: carrega uma **varinha** e conjura. A magia é
de cuidado — núcleo branco-quente, halo verde de crescimento, nunca azul arcano — e **não**
dessatura com o mundo. **Doente é desbotado, não escuro**: o arco doente→curado roda em
saturação, não em brilho. Sem fonte de CDN: o chrome usa a pilha do sistema e o canvas tem
uma fonte bitmap 5×7 autorada no arquivo. Detalhes e o caminho de implementação restante
estão na seção "Art direction" do `NOTES.md`.

## 4. Como trabalhar

Ciclo obrigatório, sem exceção:

```bash
node test/smoke.js     # tem que passar
git add -A && git commit -m "..." && git push
```

O `test/smoke.js` roda headless num viewport 390×844 e falha se houver erro de console,
se o segurar-pra-atacar parar de repetir, se algum upgrade não aplicar, se o terceiro
golpe não pular ou se o baque não gerar onda de choque. Ele também mede FPS e salva
prints `shot-*.png`. **Sempre olhe os prints** — o teste garante que não quebrou, não
que ficou bonito.

Ao mudar visual, tire print antes e depois e compare de verdade. Ao mudar mecânica,
atualize a tabela e as fórmulas no `NOTES.md` no mesmo commit.

Se o smoke test falhar depois de um push, conserte ou reverta **imediatamente** —
a produção está no ar.

## 5. Autonomia e modo contínuo

Você tem autonomia para escolher e executar o próximo trabalho **sem perguntar nada**.
Não peça aprovação para tarefas da fila abaixo, nem para refatoração, teste, correção de
bug ou polimento visual. O dono deste projeto pediu explicitamente que você trabalhe
sozinho — tratar cada decisão como uma pergunta é desobedecer, não ser cuidadoso.

### Protocolo de sessão

Toda sessão, mesmo que a mensagem do humano seja só "continue" ou vazia:

1. Leia a seção **Diário** no fim do `NOTES.md`. Ela diz onde a última sessão parou.
2. Escolha a próxima tarefa: o primeiro item não concluído da fila da seção 6; se a fila
   acabou, gere trabalho novo pelo critério da seção 6(f).
3. Execute em incrementos pequenos. Cada incremento termina em `node test/smoke.js`
   verde e um push.
4. Acrescente uma entrada ao Diário do `NOTES.md`: o que fez, o que **mediu** (número,
   não impressão), o que quebrou, que dúvida nova apareceu, e qual é o próximo passo.
   Commite junto.
5. **Não pare aqui.** Volte ao passo 2 e pegue a próxima tarefa. Continue até acabar o
   contexto ou o orçamento da sessão. Só então escreva um resumo curto.

Nunca encerre uma resposta com "o que você quer que eu faça agora?" ou "quer que eu
continue?". Escolha e faça. Se estiver em dúvida entre duas tarefas, pegue a que estiver
mais alta na fila e registre a dúvida no Diário.

### Quando parar de verdade

Pare e chame o humano só nestes casos:

- Ia mexer nas regras invioláveis da seção 2.
- Ia mudar o alvo do prestígio (50 mil) ou a curva de custo (`15 × 1,15^n`) — são o
  coração do teste de 3 dias.
- Ia adicionar dependência externa, backend, serviço de terceiros ou variável de ambiente.
- Ia apagar ou renomear coisa **fora** do repositório (projeto na Vercel, repo no GitHub).
- O mesmo teste falhou duas vezes seguidas e você não entende por quê. Reverta para o
  último commit verde, deixe a produção sã, e só então relate.

Fora disso: siga sozinho.

## 6. Fila de trabalho, em ordem

**(a) Medir se o segurar-pra-atacar matou a tensão do jogo.** É a tarefa mais
importante e provavelmente a mais valiosa do repositório inteiro.

O problema: segurar o botão rende impacto **sem gerar cansaço**. Com *Better tools for
all* (3×) e *Fair share* (1,3×), segurar a 7 golpes/s dá ~27 de impacto/s, limpo. Um
projeto em GO FAST com *Big campaigns* rende 7,8/s e suja o time. Se em boa parte da
partida a jogada ótima for "segura o botão e ignora o ritmo", o jogo deixou de medir a
decisão que ele existe para medir.

Escreva uma simulação headless (sem navegador, só as fórmulas em Node) que jogue a
partida com estratégias diferentes — só segurando, só projetos em fast, só projetos em
steady, e misturas — e compare tempo até 50 mil de impacto total. Se segurar dominar,
proponha e aplique a correção mínima. Candidatas: fazer o toque gerar um pouco de
cansaço em modo fast; dar teto ao ganho por segundo vindo de toque; ou fazer *Fair
share* valer só para projetos. **Escolha uma, não três.** Documente o número medido no
`NOTES.md`.

**(b) Instrumentar retenção.** O protótipo não sabe responder à própria pergunta. Grave
no `localStorage` um conjunto de dias distintos em que houve sessão, o tempo total
jogado e quantas vezes a tocha foi passada. Mostre isso numa tela discreta (um toque
longo no ícone da tocha serve). Sem serviço externo, sem coleta de nada pessoal.

**(c) Tirar o `confirm()` do prestígio.** É um diálogo do navegador no meio de um jogo
pixel art em tela cheia; no celular quebra a imersão. Troque por um painel no estilo das
sheets existentes.

**(d) Corrigir o ganho offline.** Hoje usa a eficiência do momento do save, então uma
noite inteira com o time sujo rende mais do que deveria. O cansaço já é resolvido em
forma fechada; faça o ganho integrar junto, em vez de usar a taxa congelada.

**(e) Apagar o `PUSH.md`.** Ensina a criar o repositório e conectar a Vercel — as duas
coisas já feitas. Só confunde.

**(f) Depois disso, você decide — e a fila nunca acaba.** Critério único: prefira o que
aumenta a chance de alguém **voltar no dia seguinte**. Um motivo para voltar amanhã vale
mais que um efeito visual novo. O visual já passou por muitas rodadas e está num patamar
bom — só mexa nele se tiver um motivo claro, não por hábito.

Quando precisar gerar trabalho novo, escolha uma destas lentes, alternando entre elas
para não cair em monocultura:

- **Medir**: que afirmação sobre o jogo você está aceitando sem número? Meça.
- **Primeiros cinco minutos**: alguém que abre agora entende o que fazer? Onde trava?
- **Volta no dia 2**: o que a pessoa encontra de novo ao voltar? Hoje é pouco.
- **Fim de partida**: passar a tocha é satisfatório ou é só um reset?
- **Robustez**: save corrompido, aba em segundo plano por horas, tela pequena, relógio
  do sistema mudado — o jogo aguenta?
- **Subtração**: o que dá pra tirar sem o jogo piorar? Protótipo bom é enxuto.

Registre no Diário a lente que usou e por quê. Se três sessões seguidas não moverem a
pergunta das três dias, pare de polir e volte para a lente **Medir**.

## 7. Infraestrutura

Produção: <https://save-the-world-idle.vercel.app> · Repo:
`mrcx-code/save-the-world-idle` · Push na `main` publica sozinho.
Não há segredo, variável de ambiente nem backend. Se um dia precisar de algo assim,
pare e pergunte — provavelmente é sinal de que o escopo escorregou.
