# Burger House — DESIGN.md

Direção travada pela referência (hero laranja com burger "explodido"). A ousadia fica num lugar só: o burger 3D. Todo o resto é quieto e disciplinado.

## Cor (CSS vars em `src/style.css`, constantes em `src/theme.js`)
| Token | Hex | Papel |
|---|---|---|
| `--bg-1` | #C2410C | topo/centro do gradiente de fundo |
| `--bg-2` | #7C2D12 | base do gradiente, bordas |
| `--vignette` | #2A0E04 | vinheta escura nas bordas |
| `--accent-1` | #FF6A13 | botões, ícones, "Perfect Burger" |
| `--accent-2` | #FF8A1F | fim do gradiente de destaque, hover |
| `--glow` | #FFB25C | brilho radial atrás do burger |
| `--text` | #FFFFFF | títulos |
| `--text-2` | rgba(255,255,255,.8) | parágrafos |
| `--glass` | rgba(60,25,10,.6) | cartões e botões secundários, `backdrop-filter: blur(14px)` |
| `--glass-line` | rgba(255,190,140,.18) | borda sutil do glass |

Contraste: texto branco sobre #7C2D12–#C2410C ≥ 4.5:1. Botão laranja usa texto #2A0E04? Não: a referência usa branco; branco sobre #FF6A13 dá ~2.9:1, então os botões ganham texto em peso 700 e 17px+ (texto grande) e o gradiente começa em #F25C05 para chegar a 3:1+ — limite de texto grande AA.

## Tipografia
- Display: **Poppins 800** (títulos), tracking -0.02em, line-height 0.95. Hero: clamp(3.2rem, 7.4vw, 6.6rem) em 3 linhas: "Taste The" branco / "Perfect" / "Burger" laranja.
- Corpo: **Inter 400/500/600**, 16–18px, line-height 1.6, linhas ≤ 60ch.
- Escala: 0.8125 / 1 / 1.25 / 1.5 / 2.25 / 3.5 / hero.

## Layout
```
[logo]        Menu Specials About Reviews Contact     [Order Now][🛒][EN][🔊]
[selo]                                   (  brilho radial  )
TASTE THE                                   pão topo + gergelim
PERFECT                                      alface / cebola / tomate
BURGER                                       queijo / carne / pão base
parágrafo                                  (folhas desfocadas flutuando)
[Order Now 🍔] [View Menu] [Monte o seu]
[▣ Fast Delivery] | [▣ Fresh Ingredients] | [▣ 4.9 Rating]
```
- Grade de 12 colunas, max 1280px, gutter 16px (mobile) / 32px. Texto alinhado à esquerda.
- Canvas WebGL fixo e opaco atrás da página: desenha o fundo (gradiente + vinheta + brilho) e o burger. O burger viaja por âncoras de seção: hero (direita) → "Camada por camada" (explode e remonta com o scroll) → some nas seções de conteúdo → volta em "Monte o seu" (esquerda).
- Mobile (<820px): coluna única, burger em cima (top 45vh do hero), toque arrasta.

## Componentes
- Botão primário: gradiente accent, raio 12px, sombra laranja suave. Secundário: glass.
- Cartões: glass, raio 20px (cartões) / 12px (botões) / 10px (caixas de ícone) — raio segue hierarquia.
- Caixa de ícone: 36px, fundo accent a 22%, ícone accent.

## Movimento
- Um momento orquestrado: carregamento → camadas caem e montam o burger.
- Respiração contínua sutil; todo o resto responde ao usuário (mouse, arrasto, clique, scroll).
- "Reduzir movimento" (e `prefers-reduced-motion`) desliga respiração, auto-rotação, parallax, partículas e carrossel automático.

## Princípios
1. O burger é o herói; a interface nunca compete com ele.
2. Fiel à referência no hero; seções abaixo herdam o mesmo vocabulário (glass marrom + laranja).
3. 60 FPS antes de efeito: qualidade cai sozinha se o FPS cair.
