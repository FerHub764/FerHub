import React from "react";
import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import TL from "./timeline.json";

// ---------------------------------------------------------------- brand tokens
export const C = {
  ink: "#0A0705",
  night: "#140D08",
  gold: "#D9A441",
  goldLight: "#F2D28B",
  cream: "#F3E9D8",
  muted: "rgba(243,233,216,0.62)",
};
export const SERIF = "Playfair";
export const SANS = "Manrope";
export const CONDENSED = "Anton";

export const fontsReady = Promise.all([
  loadFont({ family: SERIF, url: staticFile("fonts/Playfair600.ttf"), weight: "600" }),
  loadFont({ family: SERIF, url: staticFile("fonts/Playfair800.ttf"), weight: "800" }),
  loadFont({ family: SERIF, url: staticFile("fonts/PlayfairItalic500.ttf"), weight: "500", style: "italic" }),
  loadFont({ family: SANS, url: staticFile("fonts/Manrope400.ttf"), weight: "400" }),
  loadFont({ family: SANS, url: staticFile("fonts/Manrope600.ttf"), weight: "600" }),
  loadFont({ family: SANS, url: staticFile("fonts/Manrope800.ttf"), weight: "800" }),
  loadFont({ family: CONDENSED, url: staticFile("fonts/Anton-Regular.ttf"), weight: "400" }),
]);

// 9:16 safe zone: platforms cover the top ~11% and bottom ~22%
export const SAFE = { top: 230, bottom: 1500, side: 90 };
export const BEAT = TL.beat;

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const ramp = (frame: number, a: number, b: number, from = 0, to = 1, easing = EASE_OUT) =>
  interpolate(frame, [a, b], [from, to], { ...clamp, easing });

// 1 on every beat, decaying fast
export const beatPulse = (frame: number, from = 0) => {
  if (frame < from) return 0;
  const p = ((frame - from) % BEAT) / BEAT;
  return Math.exp(-p * 6);
};

// ---------------------------------------------------------------- the Blender renders
export const Shot: React.FC<{
  name: "glass" | "pct";
  speed?: number;
  frames?: number;
  hold?: number; // freeze on this frame
  blur?: number;
  dim?: number;
  zoom?: [number, number];
  duration: number;
}> = ({ name, speed = 1, frames = 90, hold, blur = 0, dim = 0, zoom = [1, 1], duration }) => {
  const frame = useCurrentFrame();
  const idx = hold ?? Math.min(frames, Math.floor(frame * speed) + 1);
  const src = staticFile(`shots/${name}/${name}_${String(idx).padStart(4, "0")}.png`);
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, overflow: "hidden" }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: blur ? `blur(${blur}px)` : undefined,
          scale: interpolate(frame, [0, duration], zoom, clamp),
        }}
      />
      {dim > 0 ? <AbsoluteFill style={{ backgroundColor: `rgba(10,7,5,${dim})` }} /> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- finishing layers
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const x = Math.floor(random(`gx${frame}`) * 512);
  const y = Math.floor(random(`gy${frame}`) * 512);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile("grain.png")})`,
        backgroundPosition: `${x}px ${y}px`,
        mixBlendMode: "overlay",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

export const LightLeak: React.FC<{ seed?: number; opacity?: number }> = ({ seed = 1, opacity = 0.35 }) => {
  const frame = useCurrentFrame();
  const x = 50 + 40 * Math.sin(frame / 70 + seed);
  const y = 30 + 25 * Math.cos(frame / 90 + seed * 2);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, rgba(255,150,50,0.55), rgba(255,120,30,0.0) 45%)`,
        mixBlendMode: "screen",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// a word that rises out of a mask
export const Rise: React.FC<{
  children: React.ReactNode;
  at: number;
  out?: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({ children, at, out, dur = 18, style }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, at, at + dur);
  const outP = out === undefined ? 0 : ramp(frame, out, out + 12, 0, 1, EASE_IN_OUT);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", ...style }}>
      <div
        style={{
          translate: `0px ${(1 - inP) * 110 - outP * 110}%`,
          opacity: Math.min(inP * 1.4, 1 - outP),
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const GoldRule: React.FC<{ at: number; width?: number; dur?: number }> = ({ at, width = 220, dur = 20 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        height: 2,
        width: width * ramp(frame, at, at + dur),
        background: `linear-gradient(90deg, rgba(217,164,65,0), ${C.gold}, rgba(217,164,65,0))`,
        margin: "0 auto",
      }}
    />
  );
};

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.gold,
  size = 26,
  style,
}) => (
  <div
    style={{
      fontFamily: SANS,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: "0.38em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);
