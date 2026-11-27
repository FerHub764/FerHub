// Constantes do jogo. A física roda em passos fixos de 1/60 s, então
// todas as velocidades estão em pixels por quadro.
export const TILE = 16;
export const STEP = 1 / 60;

export const PHYS = {
  runMax: 2.1,
  accelGround: 0.4,
  decelGround: 0.45,
  accelAir: 0.28,
  decelAir: 0.1,
  airDrag: 0.04,
  iceAccel: 0.06,
  iceDecel: 0.018,

  gravity: 0.28,
  apexMul: 0.55,
  apexThreshold: 0.7,
  maxFall: 5.0,
  wallSlideMax: 1.2,

  jumpV: 5.6,
  jumpCut: 0.45,
  coyote: 6,
  buffer: 8,

  wallJumpVX: 2.7,
  wallJumpVY: 5.3,
  wallJumpLock: 8,
  wallCoyote: 5,

  dashSpeed: 5.2,
  dashFrames: 10,
  dashEndSpeed: 2.5,
  dashCooldown: 16,
  dashJumpVX: 3.4,

  stompBounce: 4.4,
  stompBounceHeld: 6.0,
  dashHitBounce: 4.8,
  springV: 8.6,
};

// Caixa de colisão da Faísca (o desenho tem 12x14).
export const PW = 10;
export const PH = 12;
