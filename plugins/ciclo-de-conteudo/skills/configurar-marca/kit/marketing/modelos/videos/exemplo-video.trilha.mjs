// Trilha e efeitos do vídeo de exemplo "Teste de 3 segundos", sintetizados aqui: sem arquivo de terceiros, sem direito autoral.
// Copie para videos/<slug>.trilha.mjs junto com a coreografia e adapte os acordes e os efeitos de cada gesto.
// Lê a mesma linha do tempo T da coreografia, então cada som cai no quadro do gesto.
//
// Estrutura (120 bpm, 1 tempo = 500 ms):
//   0 a 2,5 s   abertura: acorde suave e um dedilhado subindo
//   2,5 a 5 s   contagem: quase silêncio, um tic por número e um sopro que sobe até a batida
//   5 a 14,5 s  a batida entra com o papel; acordes F · Am · Dm · B♭ · C
//   14,5 s      resolve em Fá com o logo e vai sumindo até o fim

const SR = 48000;

// ─── Utilidades ─────────────────────────────────────────────────────────
function aleatorio(semente) {
  return () => {
    semente |= 0; semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = aleatorio(20261001);
const ruido = () => rnd() * 2 - 1;
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const TAU = Math.PI * 2;

function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (u) => ((ax * u + bx) * u + cx) * u, sy = (u) => ((ay * u + by) * u + cy) * u;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, u = x;
    for (let i = 0; i < 40; i++) { if (sx(u) < x) lo = u; else hi = u; u = (lo + hi) / 2; }
    return sy(u);
  };
}
const EASE_OUT = bezier(0.22, 1, 0.36, 1);

/** Filtro biquad (RBJ) com frequência que pode variar a cada amostra. */
function filtro(tipo, sinal, freq, q = 0.8) {
  const out = new Float32Array(sinal.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0, b1, b2, a1, a2;
  for (let i = 0; i < sinal.length; i++) {
    if (i % 16 === 0) {
      const f = typeof freq === 'function' ? freq(i / sinal.length) : freq;
      const w = (TAU * Math.min(f, SR * 0.45)) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al;
      if (tipo === 'banda') { b0 = al / a0; b1 = 0; b2 = -al / a0; }
      else if (tipo === 'graves') { b0 = (1 - cs) / 2 / a0; b1 = (1 - cs) / a0; b2 = b0; }
      else { b0 = (1 + cs) / 2 / a0; b1 = -(1 + cs) / a0; b2 = b0; }
      a1 = (-2 * cs) / a0; a2 = (1 - al) / a0;
    }
    const x = sinal[i];
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    out[i] = y;
  }
  return out;
}

function sinal(seg, fn) {
  const n = Math.round(seg * SR), s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = fn(i / SR, i / n);
  return s;
}
const ruidoBranco = (seg) => sinal(seg, () => ruido());

// ─── Instrumentos ───────────────────────────────────────────────────────

/** Acorde de fundo: dente-de-serra escuro, 3 vozes levemente desafinadas, ataque e saída lentos. */
function pad(notas, seg, { ataque = 0.5, saida = 0.6 } = {}) {
  const total = seg + saida;
  const s = new Float32Array(Math.round(total * SR));
  for (const m of notas) {
    for (const cents of [-7, 0, 7]) {
      const f = hz(m) * Math.pow(2, cents / 1200);
      const fase = rnd() * TAU;
      const hs = [];
      for (let h = 1; h * f < 3500; h++) hs.push([h, (1 / h) * Math.exp((-h * f) / 900)]);
      for (let i = 0; i < s.length; i++) {
        const t = i / SR;
        let v = 0;
        for (const [h, a] of hs) v += a * Math.sin(TAU * f * h * t + fase * h);
        s[i] += v;
      }
    }
  }
  const norma = 1 / (notas.length * 3 * 1.6);
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / ataque) * (t > seg ? Math.max(0, 1 - (t - seg) / saida) : 1);
    s[i] *= norma * env * env;
  }
  return s;
}

/** Corda dedilhada (Karplus-Strong), macia. */
function corda(midi, seg = 1.4, brilho = 0.5) {
  const n = Math.round(seg * SR), s = new Float32Array(n);
  const p = Math.max(2, Math.round(SR / hz(midi)));
  const buf = new Float32Array(p);
  let ant = 0;
  for (let i = 0; i < p; i++) { ant = ant * (1 - brilho) + ruido() * brilho; buf[i] = ant; }
  for (let i = 0; i < n; i++) {
    const j = i % p, k = (i + 1) % p;
    const v = buf[j];
    buf[j] = 0.4985 * (buf[j] + buf[k]);
    s[i] = v * Math.min(1, i / 60);
  }
  return s;
}

/** Marimba: tom de madeira com o 4º harmônico curto. */
function marimba(midi, seg = 1.2) {
  const f = hz(midi);
  return sinal(seg, (t) => Math.min(1, t * 400) * (Math.sin(TAU * f * t) * Math.exp(-t * 5) + 0.28 * Math.sin(TAU * f * 4 * t) * Math.exp(-t * 22)));
}

function bumbo(forte = 1) {
  let fase = 0;
  return sinal(0.5, (t) => {
    fase += (TAU * (46 + 110 * Math.exp(-t * 32))) / SR;
    return forte * Math.sin(fase) * Math.exp(-t * 6.5) + 0.2 * ruido() * Math.exp(-t * 300);
  });
}
const estalo = () => filtro('banda', sinal(0.25, () => ruido()), 1700, 0.9).map((v, i) => v * 1.6 * Math.exp((-i / SR) * 22));
const chimbal = (forte = 1) => filtro('agudos', ruidoBranco(0.08), 7500, 0.7).map((v, i) => v * forte * Math.exp((-i / SR) * 70));
function baixo(midi, seg) {
  const f = hz(midi);
  return sinal(seg, (t) => Math.min(1, t * 80) * Math.exp(-t * 2.2) * (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * t)));
}

// ─── Efeitos ────────────────────────────────────────────────────────────

/** Sopro de ar: ruído numa banda que corre de f0 a f1; o volume cresce até o pico e cai. */
function sopro(seg, f0, f1, pico = 0.6, q = 1.1) {
  const s = filtro('banda', ruidoBranco(seg), (p) => f0 * Math.pow(f1 / f0, p), q);
  for (let i = 0; i < s.length; i++) {
    const p = i / s.length;
    s[i] *= 2.2 * (p < pico ? Math.pow(p / pico, 2) : Math.pow(1 - (p - pico) / (1 - pico), 1.6));
  }
  return s;
}
function bolha(f0 = 280, f1 = 820, seg = 0.18) {
  let fase = 0;
  return sinal(seg, (t, p) => {
    fase += (TAU * (f0 + (f1 - f0) * Math.min(1, t / 0.06))) / SR;
    return Math.sin(fase) * Math.min(1, t * 600) * Math.exp(-t * 28);
  });
}
const tique = (f = 1200, forte = 1) =>
  sinal(0.16, (t) => forte * (Math.sin(TAU * f * t) * Math.exp(-t * 55) + 0.35 * Math.sin(TAU * f * 2.71 * t) * Math.exp(-t * 95) + 0.25 * ruido() * Math.exp(-t * 400)));
const toque = (f = 620) => sinal(0.14, (t) => Math.sin(TAU * f * t) * Math.min(1, t * 900) * Math.exp(-t * 38));
const clique = () => sinal(0.025, (t) => (Math.sin(TAU * 3200 * t) * 0.6 + ruido() * 0.4) * Math.exp(-t * 260));
function rabisco(seg) {
  const s = filtro('banda', ruidoBranco(seg), 3200, 1.6);
  const r = aleatorio(7);
  let alvo = 0, atual = 0;
  for (let i = 0; i < s.length; i++) {
    if (i % 1400 === 0) alvo = 0.35 + r() * 0.65;
    atual += (alvo - atual) * 0.004;
    const p = i / s.length;
    s[i] *= atual * Math.min(1, p * 12) * Math.min(1, (1 - p) * 6);
  }
  return s;
}
const grave = (seg = 0.7, f = 52) => sinal(seg, (t) => Math.sin(TAU * f * t) * Math.min(1, t * 200) * Math.exp(-t * 5));

// ─── Mixagem ────────────────────────────────────────────────────────────

export function gerar({ T, fim }) {
  const n = Math.ceil((fim / 1000 + 0.25) * SR);
  const bus = () => [new Float32Array(n), new Float32Array(n)];
  const musica = bus(), bateria = bus(), efeitos = bus();
  /** Põe o som em seg (s) no barramento, com ganho e pan (-1 esquerda, 1 direita; pode ser função de 0 a 1). */
  function poe([L, R], seg, s, ganho = 1, pan = 0) {
    const ini = Math.round(seg * SR);
    for (let i = 0; i < s.length; i++) {
      const j = ini + i;
      if (j < 0 || j >= n) continue;
      const pp = typeof pan === 'function' ? pan(i / s.length) : pan;
      const a = ((pp + 1) * Math.PI) / 4;
      L[j] += s[i] * ganho * Math.cos(a);
      R[j] += s[i] * ganho * Math.sin(a);
    }
  }
  const ms = (x) => x / 1000;
  const B = 0.5; // 1 tempo
  const batida = ms(T.batida);
  const resolve = ms(T.logo);

  // Abertura: Fá com nona, dedilhado subindo.
  poe(musica, 0.1, pad([53, 57, 60, 64, 67], ms(T.corteBaixo.start) - 0.05, { ataque: 0.9, saida: 0.25 }), 1.15);
  [65, 69, 72, 76, 79, 76, 81, 79].forEach((m, i) => poe(musica, 0.5 + i * 0.25, corda(m, 1.2, 0.35), 0.3, i % 2 ? 0.3 : -0.3));

  // Contagem: um zumbido grave e o sopro que sobe até a batida.
  poe(musica, ms(T.corteBaixo.start) + 0.1, sinal(batida - ms(T.corteBaixo.start), (t, p) => Math.min(1, t * 2) * (1 - p * 0.3) * (Math.sin(TAU * hz(53) * t) + 0.4 * Math.sin(TAU * hz(60) * t))), 0.07);
  poe(efeitos, ms(T.numeros[2]), sopro(batida - ms(T.numeros[2]), 250, 6000, 0.97, 0.9), 0.35);

  // Corpo: 120 bpm a partir da batida, 1 compasso (4 tempos) por acorde.
  const acordes = [
    { notas: [53, 57, 60, 64], raiz: 41, arp: [65, 69, 72, 76] }, // Fmaj7
    { notas: [57, 60, 64, 67], raiz: 45, arp: [69, 72, 76, 79] }, // Am7
    { notas: [50, 53, 57, 60, 64], raiz: 38, arp: [62, 65, 69, 72] }, // Dm9
    { notas: [58, 62, 65, 69], raiz: 46, arp: [70, 74, 77, 81] }, // B♭maj7
    { notas: [55, 60, 65, 67], raiz: 48, arp: [67, 72, 77, 79], tempos: 3 }, // Csus4, 3 tempos até o logo
  ];
  let t0 = batida;
  const bumbos = [];
  acordes.forEach((a, ci) => {
    const tempos = a.tempos || 4, dur = tempos * B;
    poe(musica, t0, pad(a.notas, dur, { ataque: 0.08, saida: 0.35 }), 0.7);
    const ordem = [0, 2, 1, 3, 2, 1, 3, 2];
    for (let k = 0; k < tempos * 2; k++) poe(musica, t0 + k * (B / 2), corda(a.arp[ordem[k % 8]], 0.9, 0.3), k % 2 ? 0.14 : 0.2, k % 2 ? 0.35 : -0.35);
    for (let b = 0; b < tempos; b++) {
      const tb = t0 + b * B;
      if (b === 0 || b === 2) { poe(bateria, tb, bumbo(), 0.7); bumbos.push(tb); poe(musica, tb, baixo(a.raiz, b === 0 ? 0.9 : 0.6), 0.5); }
      if (b === 1 || b === 3) poe(bateria, tb, estalo(), 0.32, 0.1);
      poe(bateria, tb, chimbal(0.5), 0.2, 0.25);
      poe(bateria, tb + B / 2, chimbal(1), 0.26, 0.25);
    }
    // Viradinha no fim do último compasso, antes do logo.
    if (ci === acordes.length - 1) [0, 1, 2, 3].forEach((k) => poe(bateria, t0 + 2 * B + k * (B / 4), chimbal(0.6 + k * 0.15), 0.24, 0.25));
    t0 += dur;
  });

  // Resolução: Fá maior aberto com o logo, sem bateria, sumindo até o fim.
  poe(bateria, resolve, bumbo(1.1), 0.8);
  bumbos.push(resolve);
  poe(musica, resolve, baixo(41, 2.5), 0.55);
  poe(musica, resolve, pad([53, 60, 64, 67, 69, 72], ms(fim) - resolve - 0.9, { ataque: 0.05, saida: 0.9 }), 0.95);
  [77, 81, 84, 88].forEach((m, i) => poe(musica, resolve + 0.75 + i * 0.5, corda(m, 1.6, 0.3), 0.2, i % 2 ? 0.3 : -0.3));

  // Bombeia a música a cada bumbo, para a batida respirar.
  for (const [L, R] of [musica]) {
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      let g = 1;
      for (const tb of bumbos) if (t >= tb && t < tb + 0.4) g = Math.min(g, 1 - 0.38 * Math.exp(-(t - tb) / 0.11));
      L[i] *= g; R[i] *= g;
    }
  }

  // ─── Efeitos no quadro do gesto ───
  poe(efeitos, ms(T.ponto.start) + 0.02, bolha(240, 760), 0.55);
  poe(efeitos, ms(T.abre.start) - 0.12, sopro(0.7, 500, 3200, 0.55), 0.3, (p) => -0.3 + p * 0.6);
  poe(efeitos, ms(T.c1Marca) + 0.05, marimba(88, 0.8), 0.18, 0.2);
  poe(efeitos, ms(T.c1Marca) + 0.11, marimba(93, 0.8), 0.12, 0.3);
  // A capa se parte: sopro descendo e um grave quando abre.
  poe(efeitos, ms(T.corteBaixo.start) - 0.15, sopro(0.65, 3500, 350, 0.4), 0.42);
  poe(efeitos, ms(T.corteBaixo.start) + 0.18, grave(0.6, 60), 0.3);
  // 3, 2, 1: tic de madeira, o último mais agudo.
  T.numeros.forEach((tn, i) => poe(efeitos, ms(tn), tique(i === 2 ? 1560 : 1170), 1, i === 2 ? 0 : i ? 0.15 : -0.15));
  // Papel subindo, e a batida já entra.
  poe(efeitos, ms(T.papel.start) - 0.05, sopro(0.55, 1500, 7000, 0.55, 0.7), 0.22);
  poe(efeitos, batida, grave(0.9, 55), 0.3);
  poe(efeitos, ms(T.marcaTexto.start), rabisco(ms(T.marcaTexto.dur)), 0.3, 0.1);
  // Cortina da direita para a esquerda, e o pan vai junto.
  poe(efeitos, ms(T.cortina.start) - 0.12, sopro(0.78, 600, 2600, 0.55), 0.4, (p) => 0.6 - p * 1.2);
  // Celular sobe e assenta.
  poe(efeitos, ms(T.celular) - 0.05, sopro(0.45, 300, 1400, 0.7), 0.25);
  poe(efeitos, ms(T.celular) + 0.3, toque(180), 0.35);
  [0, 1].forEach((i) => poe(efeitos, ms(T.metricas) + i * 0.09, toque(560 + i * 80), 0.16, i ? 0.25 : -0.25));
  // Contador: um clique a cada degrau, desacelerando como o número.
  for (let d = 1; d <= 18; d++) {
    const alvo = d / 18;
    let lo = 0, hi = 1;
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (EASE_OUT(m) < alvo) lo = m; else hi = m; }
    poe(efeitos, ms(T.conta.start) + hi * ms(T.conta.dur), clique(), 0.12 * (1 - alvo * 0.5), 0.1);
  }
  [0, 1, 2, 3].forEach((i) => {
    poe(efeitos, ms(T.cartoes) + i * 0.12 + 0.02, toque(640), 0.14, -0.2 + i * 0.13);
    poe(efeitos, ms(T.cartoes) + 0.26 + i * 0.12, bolha(600, 1100, 0.12), 0.13, -0.2 + i * 0.13);
  });
  // Celular desce.
  poe(efeitos, ms(T.c4Sai) + 0.04, sopro(0.55, 1600, 260, 0.5), 0.3);
  // Logo: 3 notas subindo no acorde de Fá enquanto ele se revela.
  [77, 81, 84].forEach((m, i) => poe(efeitos, resolve + i * 0.09, marimba(m, 1.4), 0.3, -0.25 + i * 0.25));
  poe(efeitos, resolve + 0.3, sopro(0.8, 2500, 8000, 0.3, 1.4), 0.08);
  poe(efeitos, ms(T.botao), bolha(320, 900, 0.2), 0.35);
  poe(efeitos, ms(T.botao) + 0.03, marimba(84, 1), 0.16);

  // Soma: música e bateria no mesmo nível, efeitos por cima; saturação macia e pico em -1 dB.
  const L = new Float32Array(n), R = new Float32Array(n);
  const pico = (b) => Math.max(1e-6, ...[0, 1].map((c) => b[c].reduce((m, v) => Math.max(m, Math.abs(v)), 0)));
  const gm = 0.55 / pico([musica[0].map((v, i) => v + bateria[0][i]), musica[1].map((v, i) => v + bateria[1][i])]);
  const ge = 0.6 / pico(efeitos);
  for (let i = 0; i < n; i++) {
    const fimSuave = Math.min(1, (n / SR - i / SR) / 0.35);
    L[i] = Math.tanh(((musica[0][i] + bateria[0][i]) * gm + efeitos[0][i] * ge) * 1.2) * fimSuave;
    R[i] = Math.tanh(((musica[1][i] + bateria[1][i]) * gm + efeitos[1][i] * ge) * 1.2) * fimSuave;
  }
  const p = Math.max(pico([L, R]), 1e-6);
  for (let i = 0; i < n; i++) { L[i] *= 0.89 / p; R[i] *= 0.89 / p; }
  return { sr: SR, L, R };
}

/** WAV estéreo 16 bits. */
export function wav({ sr, L, R }) {
  const n = L.length, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  return buf;
}
