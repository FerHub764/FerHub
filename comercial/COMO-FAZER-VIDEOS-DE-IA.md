# Como fazer vídeos de IA como esse

Este guia tem duas partes. A primeira explica como o comercial do DevTrilhas desta pasta foi feito. A segunda mostra como fazer vídeos realistas com as ferramentas de IA generativa que existem hoje.

---

## Parte 1: como este comercial foi feito

Neste ambiente não existe gerador de vídeo por IA instalado e não há acesso aos sites deles. Por isso o comercial foi feito como os estúdios fazem filmes de produto: **computação gráfica fotorrealista**, com câmera e luz simuladas por física.

| Etapa | Ferramenta | O que foi feito |
|---|---|---|
| Telas do produto | Playwright (navegador automático) | Capturas reais do site DevTrilhas em 2880×1800: página inicial, lição, trilha Python e certificado. |
| Cena 3D | Blender 5.3 (módulo `bpy`), todo montado por código | Mesa de nogueira, notebook de alumínio com teclado, caneca de cerâmica, caderno e caneta, janela com cidade noturna desfocada ao fundo. |
| Luz | Cycles (renderizador por *path tracing*) | Luminária quente de 2700 K à esquerda, contraluz fria da janela, brilho da própria tela e um HDRI noturno para os reflexos. |
| Câmera | Lentes de 35 a 70 mm, f/1.6 a f/3.2 | Profundidade de campo real, troca de foco (*rack focus*) no plano 3 e leve tremor de câmera na mão. |
| Render | Cycles CPU, 20 amostras e redução de ruído OpenImageDenoise | 1920×804 (scope 2.39:1), um quadro a cada dois. |
| Interpolação | `ffmpeg minterpolate` | Os quadros que faltam foram gerados por compensação de movimento, até chegar a 24 fps. |
| Cor | Python (NumPy) | Bloom nos realces, sombras frias e realces quentes, curva em S de película, vinheta e granulação de filme a cada quadro. |
| Letreiros e cartela | Pillow e fonte Inter | Frases curtas com fade e a assinatura final com o logo. |
| Trilha sonora | Síntese em Python (NumPy e SciPy) | Pad com acordes Lá menor, Fá, Dó e Sol, piano abafado, sub grave, pulso que cresce, sons de teclado, *whooshes* nos cortes, *riser* e impacto na cartela. Reverb por convolução e master em −1 dBTP. |
| Encode | ffmpeg (H.264 High e AAC) | Arquivo pronto para YouTube, Instagram e TV. |

Os scripts estão em [`fonte/`](fonte/). Para refazer:

```bash
pip install bpy==5.3.0 numpy scipy pillow     # o bpy precisa de Python 3.13
python3 fonte/bokeh.py                          # textura da cidade desfocada
python3 fonte/shots.py s1 render                # repita para s2 ... s6 (horas em CPU, minutos em GPU)
python3 fonte/audio.py                          # trilha sonora
python3 fonte/post.py                           # interpolação, cor, letreiros e cartela
```

> **Por que CGI e não IA aqui?** Geradores de vídeo ainda deformam texto e interfaces: as letras da tela "derretem" de um quadro para o outro. Num comercial de software a tela precisa estar perfeita. Por isso, mesmo usando IA, o ideal é compor as telas reais por cima (veja a Parte 2, passo 6).

---

## Parte 2: como fazer vídeos realistas com IA

### As ferramentas (as versões mudam rápido, então confira a mais recente de cada uma)

| Para quê | Ferramentas mais usadas |
|---|---|
| **Vídeo a partir de texto ou imagem** | Google **Veo** (pelo Gemini ou pelo Google Flow, e já gera áudio junto), OpenAI **Sora**, **Kling** (Kuaishou), **Runway** (Gen-4 e posteriores), **Luma** Dream Machine / Ray, **Hailuo** (MiniMax), **Pika**, **Seedance** (ByteDance) |
| **Imagens de referência (primeiro quadro)** | Midjourney, Flux (Black Forest Labs), Imagen (Google), GPT Image (OpenAI), Ideogram |
| **Narração / voz** | ElevenLabs, OpenAI TTS, Google TTS. Para pt-BR natural, ElevenLabs é o mais usado. |
| **Música** | Suno, Udio, ElevenLabs Music, ou bibliotecas licenciadas (Artlist, Epidemic Sound) |
| **Edição e cor** | DaVinci Resolve (gratuito e profissional), Premiere, CapCut |
| **Upscale e interpolação** | Topaz Video AI, ou o upscale do próprio Runway ou Kling |

### O fluxo de trabalho profissional

1. **Roteiro em planos.** Escreva plano por plano, com duração (3 a 6 s cada), o que aparece, o movimento de câmera e o texto ou fala. Um comercial de 30 s tem de 6 a 10 planos.
2. **Defina o visual uma vez.** Escolha paleta, hora do dia, lente e textura de filme e repita isso em **todos** os prompts. É o que faz os planos parecerem do mesmo filme.
3. **Gere primeiro a imagem, depois o vídeo.** Crie o primeiro quadro de cada plano num gerador de imagem, ajuste até ficar perfeito e só então anime com *image-to-video*. Dá muito mais controle e consistência do que gerar direto do texto.
4. **Gere várias versões por plano.** Faça de 4 a 8 tentativas e escolha a melhor. Erros comuns: mãos, texto, objetos que se fundem e física estranha.
5. **Planos curtos, cortes secos.** A IA fica mais estável em 4 a 6 s. Monte o comercial no editor com cortes, não peça um vídeo longo de uma vez.
6. **Telas e logos de verdade.** Grave ou capture a tela real do produto e aplique por cima no editor com *corner pin* / *planar tracking*, como no DaVinci Resolve Fusion. Também dá para pedir à IA uma tela verde ("screen showing solid green") e trocar depois.
7. **Som é metade do realismo.** Coloque narração, música e efeitos de ambiente (teclado, cidade, café). Sem som, até o melhor vídeo parece falso.
8. **Acabamento.** Corrija a cor para os planos combinarem entre si, adicione granulação leve e, se quiser, barras pretas 2.39:1 para o visual de cinema. Exporte em H.264 ou H.265, 1080p ou 4K.

### Modelo de prompt para resultado realista (escreva em inglês, que costuma funcionar melhor)

```
[TIPO DE PLANO + MOVIMENTO], [ASSUNTO E AÇÃO], [AMBIENTE], [LUZ], [LENTE/CÂMERA], [ESTILO]

Exemplo:
Slow dolly-in, close-up of a young Brazilian woman typing on a laptop at night,
the screen's cool glow on her face, warm tungsten desk lamp from the left,
city lights softly out of focus through the window behind her.
Shot on ARRI Alexa Mini, 50mm lens, f/1.8, shallow depth of field,
natural skin texture, subtle film grain, muted teal-and-amber grade,
photorealistic commercial cinematography. No text, no logos.
```

**Palavras que ajudam no realismo:** `photorealistic`, `shot on ARRI Alexa / RED / Sony Venice`, `35mm / 50mm / 85mm lens`, `shallow depth of field`, `natural skin texture`, `film grain`, `soft practical lighting`, `handheld subtle movement`, `commercial cinematography`.

**O que evitar:** muitas ações no mesmo plano, texto dentro do vídeo, mãos em close fazendo algo complexo, movimentos de câmera rápidos e "cinematic" sozinho sem lente, luz e câmera.

### Cuidados

- **Direitos de imagem:** não gere pessoas reais nem famosas sem autorização, nem marcas de terceiros.
- **Transparência:** algumas plataformas (YouTube, Meta, TikTok) pedem para marcar conteúdo gerado por IA realista. Confira as regras de anúncios de cada uma.
- **Licença comercial:** confira se o seu plano na ferramenta permite uso comercial dos vídeos, das vozes e das músicas.
- **Custo:** cada segundo gerado gasta créditos, e um comercial de 30 s pode precisar de 50 a 100 gerações até ficar bom. Planeje o roteiro antes de gerar.
