import React from "react";
import { Composition, Folder } from "remotion";
import TL from "./timeline.json";
import { Ad } from "./Ad";
import { fontsReady } from "./brand";
import { Build, Drop, End, Family, Hero, Menu, Music } from "./scenes";

void fontsReady;
const S = TL.scenes;
const dims = { width: 1080, height: 1920, fps: TL.fps };
const scenes = { Hero, Menu, Music, Family, Build, Drop, End } as const;
const keys = { Hero: "hero", Menu: "menu", Music: "music", Family: "family", Build: "build", Drop: "drop", End: "end" } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SalMalteBlackNovember" component={Ad} durationInFrames={TL.total} {...dims} />
    <Folder name="Cenas">
      {(Object.keys(scenes) as (keyof typeof scenes)[]).map((n) => (
        <Composition key={n} id={n} component={scenes[n]} durationInFrames={S[keys[n]][1] - S[keys[n]][0]} {...dims} />
      ))}
    </Folder>
  </>
);
