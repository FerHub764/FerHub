"""Post: interpolate -> grade -> supers -> end card -> encode."""
import os, subprocess, sys, glob, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W = '/tmp/claude-0/work'
FPS = 24
OUT_W, OUT_H, IMG_H = 1920, 1080, 804
BAR = (OUT_H - IMG_H) // 2
FONT = '/usr/share/fonts/opentype/inter/'
SHOTS = [('s1', 96), ('s2', 120), ('s3', 120), ('s4', 120), ('s5', 120), ('s6', 120)]
END_FRAMES = 5 * FPS  # end card 29s -> 34s

SUPERS = {  # shot: (text, start_s, end_s) relative to shot
    's1': ('Toda carreira em tecnologia começa no mesmo lugar.', 0.7, 3.7),
    's2': ('Na primeira linha de código.', 0.8, 4.4),
    's3': ('Lições curtas. Código que roda direto no navegador.', 0.8, 4.4),
    's4': ('14 trilhas. Python, JavaScript, Java, Go, Rust e mais.', 0.8, 4.4),
    's5': ('Prova final. Certificado com o seu nome.', 0.8, 4.4),
    's6': ('Do zero ao avançado. No seu ritmo.', 0.8, 4.0),
}

rng = np.random.default_rng(11)


def interpolate(name, n):
    src = f'{W}/frames/{name}'
    dst = f'{W}/interp/{name}'
    os.makedirs(dst, exist_ok=True)
    tmp = f'{W}/interp/{name}_src'
    shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
    files = sorted(glob.glob(src + '/*.png'))
    for i, f in enumerate(files):
        os.symlink(f, f'{tmp}/{i:04d}.png')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-framerate', '12', '-i', f'{tmp}/%04d.png',
                    '-vf', 'minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1',
                    '-start_number', '1', f'{dst}/%04d.png'], check=True)
    got = sorted(glob.glob(dst + '/*.png'))
    # pad to n frames by holding the last frame
    for k in range(len(got) + 1, n + 1):
        shutil.copy(got[-1], f'{dst}/{k:04d}.png')
    return [f'{dst}/{k:04d}.png' for k in range(1, n + 1)]


# ---------- grade ----------
yy, xx = np.mgrid[0:IMG_H, 0:OUT_W]
r = np.sqrt(((xx - OUT_W / 2) / (OUT_W / 2)) ** 2 + ((yy - IMG_H / 2) / (IMG_H / 2)) ** 2)
VIGNETTE = (1 - 0.28 * np.clip(r - 0.35, 0, None) ** 1.6)[..., None]


def grade(img):
    a = np.asarray(img, np.float32) / 255.0
    # bloom from highlights
    lum = a.mean(2, keepdims=True)
    hi = np.clip((a - 0.55) * 1.8, 0, 1) * (lum > 0.3)
    hiimg = Image.fromarray((hi * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(18))
    a = a + 0.22 * np.asarray(hiimg, np.float32) / 255.0
    # split tone: cool shadows, warm highlights
    lum = a.mean(2, keepdims=True)
    sh = np.clip(1 - lum * 2.2, 0, 1)
    a = a + sh * np.array([-0.006, 0.002, 0.012]) + (1 - sh) * lum * np.array([0.012, 0.004, -0.01])
    # gentle S-curve + lifted blacks (film)
    a = np.clip(a, 0, 1)
    a = a * a * (3 - 2 * a) * 0.35 + a * 0.65
    a = 0.012 + a * 0.985
    a *= VIGNETTE
    # grain (luma, per frame)
    g = rng.normal(0, 0.013, (IMG_H // 2, OUT_W // 2)).astype(np.float32)
    g = np.asarray(Image.fromarray(((g + 0.5) * 255).clip(0, 255).astype(np.uint8)).resize((OUT_W, IMG_H), Image.BILINEAR), np.float32) / 255 - 0.5
    a = a + g[..., None] * (0.6 + 0.6 * (1 - a))
    return np.clip(a, 0, 1)


def fade_alpha(t, a, b, d=0.45):
    if t < a or t > b:
        return 0.0
    k = min((t - a) / d, (b - t) / d, 1.0)
    return k * k * (3 - 2 * k)


font_super = ImageFont.truetype(FONT + 'Inter-Light.otf', 38)


def draw_super(canvas, text, alpha, t_rel):
    if alpha <= 0:
        return canvas
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    tw = d.textlength(text, font=font_super)
    x = (OUT_W - tw) / 2
    y = BAR + IMG_H + 44 + (1 - alpha) * 6
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((x, y + 2), text, font=font_super, fill=(0, 0, 0, int(170 * alpha)))
    sh = sh.filter(ImageFilter.GaussianBlur(6))
    d.text((x, y), text, font=font_super, fill=(240, 236, 228, int(255 * alpha)))
    return Image.alpha_composite(Image.alpha_composite(canvas, sh), layer)


def logo_mark(size):
    s = size * 4
    im = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.24), fill=(255, 181, 71, 255))
    ink = (10, 14, 20, 255); w = int(s * 0.085)
    d.line([(s * 0.25, s * 0.34), (s * 0.41, s * 0.50), (s * 0.25, s * 0.66)], fill=ink, width=w, joint='curve')
    for cx, cy in ((s * 0.25, s * 0.34), (s * 0.41, s * 0.50), (s * 0.25, s * 0.66)):
        d.ellipse([cx - w / 2, cy - w / 2, cx + w / 2, cy + w / 2], fill=ink)
    d.line([(s * 0.50, s * 0.69), (s * 0.75, s * 0.69)], fill=ink, width=w)
    for cx in (s * 0.50, s * 0.75):
        d.ellipse([cx - w / 2, s * 0.69 - w / 2, cx + w / 2, s * 0.69 + w / 2], fill=ink)
    return im.resize((size, size), Image.LANCZOS)


def end_card(i):
    t = i / FPS
    bg = np.zeros((OUT_H, OUT_W, 3), np.float32)
    # faint warm glow behind the logo
    gy, gx = np.mgrid[0:OUT_H, 0:OUT_W]
    glow = np.exp(-(((gx - OUT_W / 2) / 520) ** 2 + ((gy - OUT_H / 2 + 20) / 300) ** 2))
    a_in = min(1, max(0, (t - 0.15) / 1.0)); a_in = a_in * a_in * (3 - 2 * a_in)
    a_out = min(1, max(0, (4.6 - t) / 0.4))
    bg += glow[..., None] * np.array([0.05, 0.03, 0.012]) * a_in
    g = rng.normal(0, 0.012, (OUT_H // 2, OUT_W // 2)).astype(np.float32)
    g = np.asarray(Image.fromarray(((g + 0.5) * 255).clip(0, 255).astype(np.uint8)).resize((OUT_W, OUT_H)), np.float32) / 255 - 0.5
    bg = np.clip(bg + g[..., None] * 0.5 + 0.004, 0, 1) * a_out
    canvas = Image.fromarray((bg * 255).astype(np.uint8)).convert('RGBA')
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    f_name = ImageFont.truetype(FONT + 'InterDisplay-SemiBold.otf', 96)
    f_tag = ImageFont.truetype(FONT + 'Inter-Light.otf', 36)
    f_small = ImageFont.truetype(FONT + 'Inter-Regular.otf', 24)
    mark = logo_mark(110)
    name = 'DevTrilhas'
    nw = d.textlength(name, font=f_name)
    total = 110 + 32 + nw
    x0 = (OUT_W - total) / 2; y0 = OUT_H / 2 - 95
    scale_in = a_in
    alpha = int(255 * a_in * a_out)
    m = mark.copy(); m.putalpha(m.getchannel('A').point(lambda v: v * a_in * a_out))
    layer.paste(m, (int(x0), int(y0 + (1 - scale_in) * 8)), m)
    d.text((x0 + 142, y0 + 2 + (1 - scale_in) * 8), name, font=f_name, fill=(244, 240, 232, alpha))
    a2 = min(1, max(0, (t - 1.0) / 0.9)); a2 = a2 * a2 * (3 - 2 * a2) * a_out
    tag = 'Aprenda programação do zero.'
    d.text(((OUT_W - d.textlength(tag, font=f_tag)) / 2, OUT_H / 2 + 50), tag, font=f_tag, fill=(225, 220, 212, int(255 * a2)))
    a3 = min(1, max(0, (t - 1.7) / 0.9)); a3 = a3 * a3 * (3 - 2 * a3) * a_out
    sm = '14 TRILHAS   ·   PROVAS E CERTIFICADO   ·   GRATUITO'
    spaced_w = d.textlength(sm, font=f_small) + len(sm) * 2
    x = (OUT_W - spaced_w) / 2
    for ch in sm:
        d.text((x, OUT_H / 2 + 125), ch, font=f_small, fill=(255, 181, 71, int(230 * a3)))
        x += d.textlength(ch, font=f_small) + 2
    return Image.alpha_composite(canvas, layer).convert('RGB')


def main():
    out = f'{W}/final_frames'; os.makedirs(out, exist_ok=True)
    k = 0
    only = sys.argv[1:]
    for name, n in SHOTS:
        files = interpolate(name, n)
        text, a, b = SUPERS[name]
        for i, f in enumerate(files):
            k += 1
            if only and name not in only:
                continue
            img = Image.open(f).convert('RGB')
            g = grade(img)
            if name == 's6':  # fade to black over the last second
                t = i / FPS
                g *= np.clip((5.0 - t) / 1.1, 0, 1)
            frame = np.zeros((OUT_H, OUT_W, 3), np.float32); frame[BAR:BAR + IMG_H] = g
            canvas = Image.fromarray((frame * 255).astype(np.uint8)).convert('RGBA')
            canvas = draw_super(canvas, text, fade_alpha(i / FPS, a, b), i / FPS)
            canvas.convert('RGB').save(f'{out}/{k:04d}.png', compress_level=1)
        print(name, 'done', flush=True)
    for i in range(END_FRAMES):
        k += 1
        end_card(i).save(f'{out}/{k:04d}.png', compress_level=1)
    print('frames', k)


if __name__ == '__main__':
    main()
