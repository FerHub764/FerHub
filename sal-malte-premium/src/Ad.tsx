import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import TL from "./timeline.json";
import { Grain, Vignette } from "./brand";
import { Build, Drop, End, Family, Hero, Menu, Music } from "./scenes";

const S = TL.scenes;
const seq = (k: keyof typeof S) => ({ from: S[k][0], durationInFrames: S[k][1] - S[k][0] });

export const Ad: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0A0705" }}>
    <Sequence name="Hero" {...seq("hero")}><Hero /></Sequence>
    <Sequence name="Menu" {...seq("menu")}><Menu /></Sequence>
    <Sequence name="Music" {...seq("music")}><Music /></Sequence>
    <Sequence name="Family" {...seq("family")}><Family /></Sequence>
    <Sequence name="Build" {...seq("build")}><Build /></Sequence>
    <Sequence name="Drop" {...seq("drop")}><Drop /></Sequence>
    <Sequence name="End" {...seq("end")}><End /></Sequence>
    <Vignette strength={0.7} />
    <Grain opacity={0.08} />
    <Audio src={staticFile("music.wav")} />
  </AbsoluteFill>
);
