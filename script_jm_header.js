
// =======================================================
// Naturheader: blad + enstaka blommor (ingen extern lib)
// =======================================================

// Canvas & 2D-context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Bas-höjd på desktop och mobil-brytpunkt
const BASE_HEIGHT = 200;          // din nuvarande headerhöjd
const MOBILE_BREAKPOINT = 640;    // px (justera vid behov)

// Aktuell css-höjd utifrån fönstrets bredd
function currentCanvasHeight() {
  return (window.innerWidth <= MOBILE_BREAKPOINT) ? BASE_HEIGHT / 2 : BASE_HEIGHT;
}

// Skalfaktor relativt desktop
function headerScale() {
  return currentCanvasHeight() / BASE_HEIGHT; // 1 på desktop, 0.5 på mobil
}


// Retina-skalning och responsiv bredd
function fitCanvasToWidth() {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth  = canvas.clientWidth || window.innerWidth;
  const cssHeight = currentCanvasHeight();   // <— responsiv höjd

  canvas.style.width  = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';
  canvas.width  = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}


// Paletter (bladen är 100% opaka)
const leafPalette = [
  // '#EAF7EA', // mycket ljus grön
  // '#DDF3DF',
  // '#CDECCF',
  '#BDE6BE',
  '#A8DDA8',
  '#95D490',
  '#81C784',  // medelgrön för lite djup
  '#27632A',
  '#2E7D32',
  '#1B5E20',
  '#33691E',
  '#2F5D31',
  '#3F6F3A',
  '#4C7A43'
  // '#3A5F0B',
  // '#4B6F1A',
  // '#486D2C',
  // '#3F6A2A',
  // '#365E24',
  // '#2D531F',
  // '#224719'
];
const flowerPetalPalette  = [
  '#FFD5CC', // ljus korall
  '#FFE0B2', // ljus aprikos
  '#FFF59D', // ljus gul
  '#ffdd47ff', // ljus orange
  '#E1BEE7', // ljus lila
  'rgba(181, 133, 195, 1)', // mörkare lila
  '#F8BBD0'  // ljus rosa
];
const flowerCenterPalette = ['#FFE57F','#FFD54F','#FBC02D']; // varma centra


// Hjälpare
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// Vertikal/horisontell utbredning för lutat blad
function leafVerticalExtent(len, wid, angleRad) {
  const a = Math.abs(angleRad);
  return (len/2) * Math.cos(a) + (wid/2) * Math.sin(a);
}
function leafHorizontalExtent(len, wid, angleRad) {
  const a = Math.abs(angleRad);
  return (wid/2) * Math.cos(a) + (len/2) * Math.sin(a);
}
function flowerVerticalExtent(radius) { return radius; }

// Klampa bara mot NEDRE kanten (tillåter topp att brytas)
function clampYBottom(y, extent, H, marginBottom) {
  const maxY = H - marginBottom - extent;
  if (y > maxY) return maxY;
  return y;
}

// ====== BLAD ======
function drawLeaf(cx, cy, len, wid, angle, fillStyle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const h = len;
  const w = wid / 2;
  const tip  = { x: 0, y: -h/2 };
  const base = { x: 0, y:  h/2 };
  const s = headerScale();        // hämta skala även här
  
// ...
  

  // Kontur som Path2D (för clip av nerver)
  const leafPath = new Path2D();
  leafPath.moveTo(base.x, base.y);
  leafPath.bezierCurveTo(-w,  h*0.25, -w, -h*0.15, tip.x, tip.y);
  leafPath.bezierCurveTo( w, -h*0.15,  w,  h*0.25, base.x, base.y);
  leafPath.closePath();

  // Fyll blad (opakt)
  ctx.fillStyle = fillStyle;
  ctx.globalAlpha = 1;
  ctx.fill(leafPath);

  // Klipp nerverna till bladet
  ctx.save();
  ctx.clip(leafPath);

  // Mittnerv (lite förkortad)
  ctx.lineWidth = 1 * s;          // mittnerv
  ctx.strokeStyle = 'rgba(0,0,0,0.10)';
  ctx.beginPath();
  ctx.moveTo(base.x, base.y - 2);
  ctx.lineTo(0, tip.y + 3);
  ctx.stroke();

  // Sidenerver – kortare & indragna
  const veins = Math.floor(rand(4,7));
  ctx.lineWidth = 0.8 * s;        // sidenerver
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  for (let i = 1; i <= veins; i++) {
    const t = i / (veins + 1);
    const y = base.y + (tip.y - base.y) * t;
    const maxSpan = w * (1 - Math.abs(t - 0.5) * 1.2);
    const endSpan = maxSpan * 0.78;
    const bend = 3, insetY = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(-endSpan*0.55, y - bend - 1, -endSpan, y - insetY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(endSpan*0.55, y - bend - 1, endSpan, y - insetY);
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
}

// ====== BLOMMA ======
// "Spetsigare" blomma: smalare kronblad och längre spets
function drawFlower(cx, cy, radius, petals, petalColor, centerColor) {
  ctx.save();
  ctx.translate(cx, cy);

  const inner = radius * 0.33;
  for (let i = 0; i < petals; i++) {
    const theta = (i / petals) * Math.PI * 2 + rand(-0.04, 0.04);
    ctx.save();
    ctx.rotate(theta);

    // Smalare, spetsigare petal
    const len = radius * rand(1.05, 1.25);
    const wid = radius * rand(0.28, 0.40);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(wid, -len*0.30, wid*0.7, -len*0.85, 0, -len);   // till spets
    ctx.bezierCurveTo(-wid*0.7, -len*0.85, -wid, -len*0.30, 0, 0);    // tillbaka
    ctx.closePath();

    ctx.fillStyle = petalColor;   // pastell, opak
    ctx.globalAlpha = 1;
    ctx.fill();

    // Disktret kontur för definierad form (valfritt men snyggt)
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    ctx.stroke();

    ctx.restore();
  }

  // Centrum
  ctx.beginPath();
  ctx.arc(0, 0, inner, 0, Math.PI * 2);
  ctx.fillStyle = centerColor;
  ctx.fill();

  ctx.restore();
}

// ====== HUVUDFUNKTION: rita headern ======
function drawHeaderArt() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const W = parseInt(canvas.style.width, 10) || window.innerWidth;
  const H = parseInt(canvas.style.height, 10) || 200;
  const s = headerScale();  // 1 på desktop, 0.5 på mobil


  // Tre bladlager + blommor
  const layers = [
  { step: 24, leafScale:[60*s,150*s], widScale:[28*s,90*s], yBand:[0.18,0.85], blend:'source-over' },
  { step: 42, leafScale:[70*s,160*s], widScale:[30*s,98*s], yBand:[0.15,0.80], blend:'source-over' },
  { step: 58, leafScale:[55*s,140*s], widScale:[24*s,84*s], yBand:[0.22,0.88], blend:'source-over' },
];


  // ----- Blad -----
  layers.forEach(layer => {
    const count = Math.max(12, Math.ceil(W / layer.step));
    const [yMinRel, yMaxRel] = layer.yBand;
    const prevBlend = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = layer.blend;

    for (let i = 0; i < count; i++) {
      // Storlek & vinkel först (behövs för kant-avklipp)
      const len   = rand(layer.leafScale[0], layer.leafScale[1]);
      const wid   = rand(layer.widScale[0],  layer.widScale[1]);
      const angle = rand(-0.7, 0.7);

      const hx = leafHorizontalExtent(len, wid, angle);
      const SIDE_OVERFLOW = Math.max(24, Math.min(120, hx * 0.95));
      const x = rand(-SIDE_OVERFLOW, W + SIDE_OVERFLOW);

      // Grund-y inom band, sedan justeringar
      let y = rand(H * yMinRel + 6, H * yMaxRel - 6);
      const vy = leafVerticalExtent(len, wid, angle);

      // 1) Tvinga bladets TOPP att börja lite ovanför canvas (anti-glipa)
      //    Topp = y - vy. Vi vill ha topp <= -marginTop.
      const marginTop = 8;
      y = Math.min(y, vy - marginTop);

      // 2) Klampa bara mot nederkant (så inget klipps i botten)
      const marginBottom = 6;
      y = clampYBottom(y, vy, H, marginBottom);

      // OPAKT blad (ingen transparens)
      ctx.globalAlpha = 1;
      drawLeaf(x, y, len, wid, angle, pick(leafPalette));
    }

    ctx.globalCompositeOperation = prevBlend;
    ctx.globalAlpha = 1;
  });

  // ----- Blommor (accent) – håll dem synliga inom ytan -----
  const flowerCount = Math.round(Math.max(1, W / 420));
  for (let i = 0; i < flowerCount; i++) {
    const x = rand(W * 0.08, W * 0.92);
    let   y = rand(H * 0.22, H * 0.78);
    const r = rand(13*s, 20*s);
    const minDist = r * 2.2;

    const petals = Math.floor(rand(5, 8));
    const petalColor  = pick(flowerPetalPalette);
    const centerColor = pick(flowerCenterPalette);

    const vy = flowerVerticalExtent(r);
    y = clampYBottom(y, vy, H, 6);

    drawFlower(x, y, r, petals, petalColor, centerColor);
  }

function randomLightAccent() {
  // Hues runt magenta/orange/guld/blå/lila – kompletterar grönt
  const hues = [330, 10, 45, 205, 260]; // magenta, röd-orange, guld, blå, lila
  const h = hues[Math.floor(Math.random() * hues.length)];
  const s = 80; // hög saturation
  const l = 68; // ljus
  return `hsl(${h}, ${s}%, ${l}%)`;
}

const MARGIN = 50;
const words = ["kärlek","frihet","tillit","fred","avslappning","styrka","sanning","stabilitet","glädje","passion","kreativitet","utveckling","hållbarhet","framtid","mening","resonans"];
const randomWord = words[Math.floor(Math.random() * words.length)];

// Sätt font innan vi mäter!
const fontPx = Math.floor(Math.random() * 18 + 14);
ctx.save();
ctx.globalCompositeOperation = 'source-over';
ctx.globalAlpha = 1;
ctx.font = `${fontPx}px Poppins Bold, Arial Black, Gadget, sans-serif`;
ctx.fillStyle = randomLightAccent();

// Mät text
const mt = ctx.measureText(randomWord);
const textW = mt.width;
const ascent  = mt.actualBoundingBoxAscent  ?? fontPx * 0.8;
const descent = mt.actualBoundingBoxDescent ?? fontPx * 0.2;

// Slumpa position inom säkra ramar
const minX = MARGIN;
const maxX = Math.max(MARGIN, (W - MARGIN - textW));
const minY = MARGIN + ascent;                 // så överkanten inte klipps
const maxY = Math.max(MARGIN + ascent, H - MARGIN - descent);

const x = rand(minX, maxX);
const y = rand(minY, maxY);

ctx.fillText(randomWord, x, y);
ctx.restore();



}

// Init & resize
function render() { fitCanvasToWidth(); drawHeaderArt(); }
// Ritar bara om om bredd eller DPR ändras (inte vid iOS scroll-höjd)
let lastWidth = Math.round(window.innerWidth);
let lastDPR   = window.devicePixelRatio || 1;
let resizeTimer = null;

function maybeRenderOnResize() {
  const w   = Math.round(window.innerWidth);
  const dpr = window.devicePixelRatio || 1;
  if (w !== lastWidth || dpr !== lastDPR) {
    lastWidth = w;
    lastDPR = dpr;
    render();
  }
}

// Debounce för säkerhets skull
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(maybeRenderOnResize, 120);
}, { passive: true });

// Rendera på orienteringsbyte (iOS byter oftast bredd då)
window.addEventListener('orientationchange', () => {
  // liten delay så Safari hinner uppdatera måtten
  setTimeout(() => { lastWidth = -1; maybeRenderOnResize(); }, 180);
}, { passive: true });

// (Valfritt) För iOS: ignorera visualViewport-höjd-resize, reagera bara på bredd
if (window.visualViewport) {
  let lastVVW = Math.round(window.visualViewport.width);
  window.visualViewport.addEventListener('resize', () => {
    const w = Math.round(window.visualViewport.width);
    if (w !== lastVVW) {
      lastVVW = w;
      lastWidth = -1; // tvinga omritning via maybeRenderOnResize
      maybeRenderOnResize();
    }
  }, { passive: true });
}

// Första render
render();