# CLAUDE.md — instruções permanentes deste repositório

Leia este arquivo e o `NOTES.md` antes de tocar em qualquer coisa.

## 1. O que é isto

`SAVE THE WORLD` é a **base de um jogo de ação lateral para celular**, em pixel art.
Começou como protótipo idle e foi enxugado até sobrar só o núcleo: uma personagem
caminha por uma rua brasileira, golpeia o que aparece, pula, e junta impacto.

O jogo inteiro é **um arquivo**: `index.html`. Sem build, sem framework, sem dependência
em runtime, sem rede. Abrir o arquivo no navegador é rodar o jogo. Isso é decisão de
projeto, não limitação — não a desfaça.

Tema: um mundo quebrado que vai sendo consertado. Meio ambiente e pautas sociais, com
mão leve. Os inimigos são abstrações — fumaça, tambor tóxico, saco de dinheiro — e o
monstro do dinheiro estoura em `SHARED!`. Se ficar com cara de palanque, foi longe demais.

## 2. Regras invioláveis

1. **Um arquivo só.** Nada de separar CSS/JS, nada de bundler, nada de CDN.
2. **Zero rede.** Nenhum `fetch`, nenhum recurso externo, nenhuma fonte de CDN. Toda arte
   é base64 embutido. Há uma `Content-Security-Policy` no `<head>` que faz o navegador
   cobrar isso — se você adicionar algo de fora, o navegador bloqueia e você vai ver no
   console. Não relaxe a CSP para contornar; o bloqueio é o ponto.
3. **O save é entrada não confiável.** `localStorage` é editável à mão. O carregamento
   passa por `ESQUEMA_SAVE`: lista fixa de campos, cada um com tipo e faixa. Campo fora
   da lista não entra; tipo errado ou fora de faixa cai no padrão. **Ao adicionar estado
   persistente, adicione ao esquema** — se não estiver lá, não é lido nem gravado.
4. **Nenhuma empresa ou político real como vilão.**
5. **Mobile primeiro.** Sem zoom, sem seleção de texto. O bloqueio de gestos e o
   `user-select: none` estão lá de propósito.
6. **`main` é produção.** Todo push publica automático na Vercel. Nunca deixe a `main`
   quebrada.

## 3. O que o jogo faz hoje

**Entrada.** A tela é dividida ao meio: metade esquerda **pula**, metade direita
**golpeia**. O botão dourado embaixo também golpeia, e repete se você segurar. O pulo
também acerta um golpe na subida.

**Combate.** Cada golpe alcança 80 px; o quinto golpe do combo alcança 96 e causa dano
dobrado, e é nele que ela salta. Os monstros caminham a rua e **passam reto** — se você
não interagir, eles saem de quadro. Chegam em intervalos sorteados, nunca num ritmo
contável.

**Economia.** É deliberadamente rasa. Impacto vem de golpear, de recolher drops (pegos
ao passar por cima) e de pegar folhas no ar pulando. Três upgrades, e só:

| | custo | efeito |
|---|---:|---|
| `u1` | 150 | cada golpe conta 3× |
| `u2` | 900 | o que você pega vale o dobro |
| `u3` | 4.000 | vizinhos ajudam sozinhos, 2 golpes/s |

Existe também um bônus por dias distintos jogados (`bonusDias`). **Não há renda passiva,
prestígio, projetos, cansaço nem fim de partida** — tudo isso existiu e foi removido.
Depois dos três upgrades, o impacto acumula sem ralo. Se você for adicionar progressão,
é aqui.

**Movimento.** O quadro do sprite é escolhido pela **distância percorrida**, não pelo
tempo — é isso que impede o pé de deslizar em qualquer velocidade. `PASSO_PX` é a
passada da caminhada e `PASSO_CORRIDA` a da corrida. As velocidades são escolhidas para
que um quadro de sprite dure um número **inteiro** de quadros de tela (cinco andando,
três correndo), senão a cadência manca.

**Cenário.** Sete pinturas em sequência, cada uma ~6 s de caminhada, repetindo depois da
sétima. Rolam **1:1 com o mundo** — não use paralaxe aqui: o chão em que ela pisa faz
parte da pintura, e qualquer fração diferente de 1 faz ela levitar. A emenda entre duas
pinturas tem cross-fade.

**Camadas de canvas.** `#fundoHD` (pintura, resolução do dispositivo) → `#scene`
(mundo em baixa resolução, pixelado) → `#heroHD` (a personagem, resolução do
dispositivo). A personagem tem canvas próprio porque, desenhada dentro do `#scene`, a
arte de 184 px era esmagada para 44 e depois ampliada de volta — seis vezes o tamanho
guardado. **Não a mova de volta para o `#scene`.**

## 4. Arte e pipeline de sprites

Direção: pôster de meio-dia, saturado, contorno duro, **zero pós-processamento**. A
personagem não é espadachim: carrega uma **varinha**. Doente é desbotado, não escuro.

Folhas de sprite chegam de fora, em PNG/WebP com fundo **magenta `#FF00FF`**. O caminho
que funciona está em `scratchpad/` (fora do repo) e vale reproduzir:

1. Recortar em células iguais, **não** por colunas vazias — a varinha atravessa a linha
   da célula e cola um quadro no outro.
2. Preencher a mancha de cada personagem no sheet inteiro (a varinha vai junto), semeando
   pela coluna com mais tinta dentro da célula — o corpo, nunca a ponta da varinha.
3. Registrar todos os quadros pela **cabeça** (centro do quinto superior). Ancorar pelo pé
   mais baixo faz ela avançar e recuar, porque numa passada o pé mais baixo é ora o da
   frente ora o de trás.
4. Uma **linha de base comum** para todos os quadros: o desenho ancora a borda inferior.
5. Comparar a escala entre folhas pela **largura da cabeça**, não pela altura — uma pose
   esticada é legitimamente mais alta.

Conjuntos em uso: `walk` (12), `run` (12), `sp` (6, o pulo), `atk1`/`atk2` (4 cada).

## 5. Como trabalhar

```bash
node test/smoke.js     # tem que passar
git add -A && git commit -m "..." && git push
```

O `test/smoke.js` roda headless num viewport 390×844 e falha se houver erro de console,
se o segurar-pra-atacar parar de repetir, se um upgrade não aplicar, se a metade errada
da tela responder, se um save adulterado envenenar o estado, ou se os monstros pararem
de andar. Ele salva prints `shot-*.png`. **Sempre olhe os prints** — o teste garante que
não quebrou, não que ficou bonito.

Ao mudar visual, tire print antes e depois e compare de verdade. Ao mudar mecânica,
atualize a tabela da seção 3 no mesmo commit.

Se o smoke test falhar depois de um push, conserte ou reverta **imediatamente** — a
produção está no ar.

## 6. Armadilhas já pagas

Cada uma destas custou uma sessão. Não repita:

- **Paralaxe no fundo.** A pintura rolava a 0,35× enquanto os pés andavam a 1,0×. Três
  quartos de cada passo eram deslize.
- **Ancorar sprite pelo pé mais baixo.** Injeta um vai-e-volta no ciclo. Ancore pela cabeça.
- **Limpar a camada da heroína fora do desenho dela.** `drawHero()` roda numa função que
  termina *antes* de `desenharMundo()`; limpar lá apaga ela no mesmo quadro.
- **Velocidade que não dá quadro inteiro de tela por pose.** A cadência sai 2-2-3-2-2-3 e
  lê como trepidação.
- **`CFG["custoU" + n]`.** Não existe `CFG.custoU1` literal em lugar nenhum, então uma
  varredura de código morto vai oferecer para apagar. Está vivo.
- **Remover função procurando o próximo `}` na coluna 0.** Para um corpo que fecha em
  chave indentada, isso corre centenas de linhas e leva declarações vizinhas junto.
  Valide balanço de chaves, colchetes e parênteses antes de apagar.

## 7. Infraestrutura

Produção: <https://save-the-world-idle.vercel.app> · Repo:
`mrcx-code/save-the-world-idle` · Push na `main` publica sozinho.
Não há segredo, variável de ambiente nem backend. Se um dia precisar de algo assim,
pare e pergunte — provavelmente é sinal de que o escopo escorregou.
