import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import TL from "./timeline.json";
import {
  BEAT, C, CONDENSED, EASE_IN_OUT, EASE_OUT, GoldRule, Label, LightLeak, Rise, SAFE, SANS, SERIF, Shot, beatPulse, ramp,
} from "./brand";

const len = (k: keyof typeof TL.scenes) => TL.scenes[k][1] - TL.scenes[k][0];
const center: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" };

// ================================================================ 1. HERO: the glass
export const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const D = len("hero");
  return (
    <AbsoluteFill>
      <Shot name="glass" speed={0.75} duration={D} zoom={[1.0, 1.04]} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,7,5,0.75) 0%, rgba(10,7,5,0) 22%, rgba(10,7,5,0) 55%, rgba(10,7,5,0.88) 82%)" }} />
      <LightLeak seed={2} opacity={0.25} />
      <div style={{ position: "absolute", top: SAFE.top + 10, left: 0, right: 0, ...center, gap: 18 }}>
        <div style={{ opacity: ramp(frame, 4, 22) }}>
          <Label size={24} color={C.cream}>Sal &amp; Malte · Gastrobar</Label>
        </div>
        <div
          style={{
            opacity: ramp(frame, 10, 26),
            scale: ramp(frame, 10, 26, 0.9, 1),
            border: `1.5px solid ${C.gold}`,
            borderRadius: 999,
            padding: "12px 30px",
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: "0.28em",
            color: C.goldLight,
            background: "rgba(10,7,5,0.45)",
          }}
        >
          BLACK NOVEMBER · 30% OFF
        </div>
      </div>
      <div style={{ position: "absolute", top: 1150, left: 0, right: 0, ...center }}>
        <Rise at={36} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 168, color: C.cream, lineHeight: 1, textShadow: "0 6px 40px rgba(0,0,0,0.85)" }}>
          Novembro
        </Rise>
        <Rise at={58} style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 76, color: C.goldLight, lineHeight: 1.1, marginTop: 6, textShadow: "0 4px 30px rgba(0,0,0,0.9)" }}>
          tem outro sabor.
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

// ================================================================ 2. MENU: one dish per two beats
export const Menu: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = TL.scenes.menu[0];
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Shot name="glass" hold={90} blur={28} dim={0.72} duration={len("menu")} zoom={[1.25, 1.35]} />
      <LightLeak seed={5} opacity={0.3} />
      <div style={{ position: "absolute", top: SAFE.top + 30, left: 0, right: 0, ...center, opacity: ramp(frame, 0, 12) }}>
        <Label size={24}>No cardápio</Label>
      </div>
      {TL.menu.map((m, i) => {
        const at = m.at - t0;
        const out = i < TL.menu.length - 1 ? at + 2 * BEAT - 8 : undefined;
        if (frame < at - 2 || (out !== undefined && frame > out + 14)) return null;
        return (
          <div key={m.word} style={{ position: "absolute", top: 760, left: 0, right: 0, ...center }}>
            <Rise at={at} out={out} dur={14} style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 132, color: C.cream, lineHeight: 1.02 }}>
              {m.word}
            </Rise>
            <div style={{ height: 26 }} />
            <GoldRule at={at + 4} width={260} dur={14} />
            <div style={{ height: 22 }} />
            <Rise at={at + 5} out={out} dur={14} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 72, color: C.goldLight }}>
              {m.sub}
            </Rise>
          </div>
        );
      })}
      {/* progress ticks: four dishes */}
      <div style={{ position: "absolute", top: 1380, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 }}>
        {TL.menu.map((m, i) => (
          <div key={i} style={{ width: 54, height: 3, borderRadius: 2, background: frame >= m.at - t0 ? C.gold : "rgba(243,233,216,0.2)" }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ================================================================ 3. MUSIC: stage beams, genres on the beat
const Beam: React.FC<{ x: number; base: number; speed: number; phase: number; color: string }> = ({ x, base, speed, phase, color }) => {
  const frame = useCurrentFrame();
  const rot = base + 10 * Math.sin(frame / speed + phase);
  return (
    <div
      style={{
        position: "absolute", left: x, top: -200, width: 260, height: 2200, transformOrigin: "50% 0%", rotate: `${rot}deg`,
        background: `linear-gradient(180deg, ${color} 0%, rgba(0,0,0,0) 75%)`, filter: "blur(18px)", mixBlendMode: "screen", opacity: 0.55,
      }}
    />
  );
};

export const Music: React.FC = () => {
  const frame = useCurrentFrame();
  const genres = ["Pagode", "Sertanejo", "MPB"];
  const pulse = beatPulse(frame);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 100%, #2a1608 0%, ${C.ink} 65%)` }}>
      <Beam x={80} base={-18} speed={38} phase={0} color="rgba(255,170,70,0.9)" />
      <Beam x={410} base={4} speed={45} phase={2} color="rgba(255,210,140,0.8)" />
      <Beam x={740} base={20} speed={41} phase={4} color="rgba(255,140,50,0.9)" />
      {/* haze */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 70%, rgba(255,170,90,0.12), rgba(0,0,0,0) 60%)" }} />
      <div style={{ position: "absolute", top: SAFE.top + 30, left: 0, right: 0, ...center, opacity: ramp(frame, 0, 12) }}>
        <Label size={24}>Toda semana</Label>
      </div>
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, ...center }}>
        <Rise at={2} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 150, color: C.cream, lineHeight: 1 }}>
          Música
        </Rise>
        <Rise at={10} style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 116, color: C.goldLight, lineHeight: 1.05 }}>
          ao vivo
        </Rise>
        <div style={{ height: 70 }} />
        <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
          {genres.map((g, i) => {
            const at = 30 + i * BEAT;
            return (
              <React.Fragment key={g}>
                {i > 0 ? <div style={{ width: 8, height: 8, borderRadius: 4, background: C.gold, opacity: ramp(frame, at - 4, at) }} /> : null}
                <div
                  style={{
                    fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: "0.22em", textTransform: "uppercase", color: C.cream,
                    opacity: ramp(frame, at, at + 8), translate: `0px ${ramp(frame, at, at + 10, 24, 0)}px`,
                  }}
                >
                  {g}
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ height: 60 }} />
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 56, color: C.muted, opacity: ramp(frame, 78, 92), translate: `0px ${ramp(frame, 78, 92, 16, 0)}px` }}>
          + esportes no telão
        </div>
      </div>
      {/* equaliser: thin gold bars breathing with the beat */}
      <div style={{ position: "absolute", top: 1330, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 9, height: 120 }}>
        {Array.from({ length: 34 }).map((_, i) => {
          const h = 14 + 70 * Math.abs(Math.sin(i * 1.7 + frame / 5)) * (0.45 + 0.55 * pulse) * (1 - Math.abs(i - 16.5) / 22);
          return <div key={i} style={{ width: 6, height: h * ramp(frame, 0, 20), borderRadius: 3, background: C.gold, opacity: 0.8 }} />;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ================================================================ 4. FAMILY: the house
export const Family: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [
    ["Espaço Kids", "e cardápio infantil"],
    ["Pet friendly", "na área interna e externa"],
    ["Aniversários", "e confraternizações"],
    ["Acessível", "Wi-Fi grátis · valet"],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Shot name="glass" hold={60} blur={34} dim={0.8} duration={len("family")} zoom={[1.4, 1.5]} />
      <LightLeak seed={9} opacity={0.22} />
      <div style={{ position: "absolute", top: SAFE.top + 30, left: 0, right: 0, ...center, opacity: ramp(frame, 0, 12) }}>
        <Label size={24}>A casa</Label>
      </div>
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, ...center }}>
        <Rise at={2} style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 104, color: C.cream, lineHeight: 1.04 }}>
          Lugar para
        </Rise>
        <Rise at={9} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 112, color: C.goldLight, lineHeight: 1.04 }}>
          a família toda.
        </Rise>
      </div>
      <div style={{ position: "absolute", top: 820, left: SAFE.side + 40, right: SAFE.side + 40, display: "flex", flexDirection: "column", gap: 34 }}>
        {items.map(([a, b], i) => {
          const at = 26 + i * BEAT;
          return (
            <div key={a} style={{ display: "flex", alignItems: "baseline", gap: 26, opacity: ramp(frame, at, at + 10), translate: `${ramp(frame, at, at + 14, -40, 0)}px 0px` }}>
              <div style={{ width: 14, height: 14, rotate: "45deg", background: C.gold, flex: "none", translate: "0px -6px" }} />
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54, color: C.cream, lineHeight: 1.1 }}>{a}</div>
                <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 36, color: C.muted, marginTop: 4 }}>{b}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1400, left: 0, right: 0, ...center, opacity: ramp(frame, 92, 104) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: "0.2em", color: C.goldLight }}>★★★★★ 4.6 NO GOOGLE</div>
      </div>
    </AbsoluteFill>
  );
};

// ================================================================ 5. BUILD: BLACK NOVEMBER, then a held breath
export const Build: React.FC = () => {
  const frame = useCurrentFrame();
  const D = len("build");
  const breath = TL.breath - TL.scenes.build[0];
  const tracking = interpolate(frame, [0, breath], [0.42, 0.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  return (
    <AbsoluteFill style={{ backgroundColor: "#050302", ...center, justifyContent: "center" }}>
      <div style={{ ...center, scale: interpolate(frame, [0, D], [0.96, 1.04]) }}>
        <div style={{ fontFamily: CONDENSED, fontSize: 250, color: C.cream, letterSpacing: `${tracking}em`, marginRight: `-${tracking}em`, lineHeight: 1, opacity: ramp(frame, 0, 10) }}>
          BLACK
        </div>
        <div style={{ height: 20 }} />
        <div style={{ fontFamily: CONDENSED, fontSize: 150, color: C.gold, letterSpacing: "0.12em", marginRight: "-0.12em", lineHeight: 1, opacity: ramp(frame, 24, 34), translate: `0px ${ramp(frame, 24, 38, 40, 0)}px` }}>
          NOVEMBER
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ================================================================ 6. DROP: the gold 30%
export const Drop: React.FC = () => {
  const frame = useCurrentFrame();
  const D = len("drop");
  const flash = interpolate(frame, [0, 10], [0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const kick = Math.exp(-frame / 6);
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <AbsoluteFill style={{ translate: `${Math.sin(frame * 2.1) * 14 * kick}px ${Math.cos(frame * 2.7) * 14 * kick - 190}px`, scale: 1.04 }}>
        <Shot name="pct" speed={0.6} duration={D} zoom={[1.12, 1.0]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,7,5,0.7) 0%, rgba(10,7,5,0) 25%, rgba(10,7,5,0) 62%, rgba(10,7,5,0.9) 85%)" }} />
      <div style={{ position: "absolute", top: SAFE.top + 40, left: 0, right: 0, ...center }}>
        <div style={{ fontFamily: CONDENSED, fontSize: 96, color: C.cream, letterSpacing: "0.1em", marginRight: "-0.1em", opacity: ramp(frame, 2, 12) }}>BLACK NOVEMBER</div>
        <div style={{ height: 14 }} />
        <GoldRule at={8} width={420} />
      </div>
      <div style={{ position: "absolute", top: 1150, left: 0, right: 0, ...center }}>
        <div style={{ fontFamily: CONDENSED, fontSize: 190, color: C.goldLight, letterSpacing: "0.14em", marginRight: "-0.14em", lineHeight: 1, opacity: ramp(frame, 8, 18), scale: ramp(frame, 8, 22, 1.25, 1) }}>
          OFF
        </div>
        <div style={{ height: 30 }} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.cream, letterSpacing: "0.06em", opacity: ramp(frame, 30, 44) }}>
          para consumo no local
        </div>
        <div style={{ height: 22 }} />
        <div style={{ opacity: ramp(frame, 46, 58), border: `1.5px solid ${C.gold}`, borderRadius: 999, padding: "12px 34px", fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: "0.24em", color: C.goldLight }}>
          ATÉ 01/12
        </div>
      </div>
      <AbsoluteFill style={{ backgroundColor: `rgba(255,236,200,${flash})` }} />
    </AbsoluteFill>
  );
};

// ================================================================ 7. END CARD
export const End: React.FC = () => {
  const frame = useCurrentFrame();
  const line = (at: number): React.CSSProperties => ({ opacity: ramp(frame, at, at + 14), translate: `0px ${ramp(frame, at, at + 16, 18, 0)}px` });
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Shot name="glass" hold={90} blur={10} dim={0.66} duration={len("end")} zoom={[1.08, 1.0]} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,7,5,0.55), rgba(10,7,5,0.35) 40%, rgba(10,7,5,0.9) 80%)" }} />
      <LightLeak seed={12} opacity={0.2} />
      <div style={{ position: "absolute", top: SAFE.top + 40, left: 0, right: 0, ...center }}>
        <div style={{ ...line(4), fontFamily: SERIF, fontWeight: 800, fontSize: 124, color: C.cream, lineHeight: 1, letterSpacing: "0.01em" }}>Sal &amp; Malte</div>
        <div style={{ height: 18 }} />
        <div style={line(10)}><Label size={28} color={C.gold}>Gastrobar · Guarulhos</Label></div>
        <div style={{ height: 30 }} />
        <GoldRule at={14} width={300} />
      </div>
      <div style={{ position: "absolute", top: 760, left: 0, right: 0, ...center }}>
        <div style={{ ...line(20), fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 96, color: C.goldLight, lineHeight: 1 }}>Reserve sua mesa</div>
        <div style={{ height: 40 }} />
        <div style={{ ...line(28), background: C.gold, borderRadius: 999, padding: "22px 48px", display: "flex", flexDirection: "column", alignItems: "center", scale: 1 + 0.025 * beatPulse(frame, 28) }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: "0.3em", color: C.ink }}>WHATSAPP</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 66, color: C.ink, letterSpacing: "0.02em", lineHeight: 1.1 }}>(11) 97054-6124</div>
        </div>
        <div style={{ height: 30 }} />
        <div style={{ ...line(36), fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.cream }}>@salemaltegastrobar</div>
      </div>
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, ...center, gap: 10 }}>
        <div style={{ ...line(44), fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.cream }}>Rua São Jorge, 60 · Macedo · Guarulhos</div>
        <div style={{ ...line(50), fontFamily: SANS, fontWeight: 400, fontSize: 30, color: C.muted }}>Ter a Qui 16h–00h · Sex 16h–01h</div>
        <div style={{ ...line(54), fontFamily: SANS, fontWeight: 400, fontSize: 30, color: C.muted }}>Sáb 11h–01h · Dom 11h–20h</div>
        <div style={{ height: 22 }} />
        <div style={{ ...line(64), fontFamily: CONDENSED, fontSize: 52, color: C.gold, letterSpacing: "0.08em" }}>30% OFF ATÉ 01/12 · CONSUMO NO LOCAL</div>
        <div style={{ ...line(70), fontFamily: SANS, fontWeight: 400, fontSize: 20, color: "rgba(243,233,216,0.45)", marginTop: 8 }}>
          Beba com moderação. Venda proibida para menores de 18 anos.
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SCENE_EASE = EASE_OUT;
