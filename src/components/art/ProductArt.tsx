import { useId, type ReactNode } from 'react';
import type { ArtKind, ImageView, Pattern } from '@/types';
import { luminance, shade } from '@/utils/color';

interface Ctx {
  c: string; dark: string; light: string; line: string; back: boolean; variant: string; gold: string; uid: string;
}
interface Spec {
  shapes: string[];
  under?: (x: Ctx) => ReactNode;
  details?: (x: Ctx) => ReactNode;
  custom?: (x: Ctx) => ReactNode;
  zoom?: string;
}

const TEE = 'M132 92 L88 112 L38 182 L84 214 L114 178 L114 420 Q114 432 126 432 L274 432 Q286 432 286 420 L286 178 L316 214 L362 182 L312 112 L268 92 Q200 130 132 92 Z';
const SHIRT = 'M134 88 L88 108 L46 330 L90 342 L116 206 L116 432 L284 432 L284 206 L310 342 L354 330 L312 108 L266 88 Q200 118 134 88 Z';
const KURTA = 'M138 72 L98 92 L52 310 L94 322 L120 196 L114 480 L286 480 L280 196 L306 322 L348 310 L302 92 L262 72 Q200 100 138 72 Z';

const buttons = (x: Ctx, ys: number[], cx = 200) =>
  ys.map((y) => <circle key={y} cx={cx} cy={y} r={4} fill={x.light} stroke={x.line} strokeWidth={1.2} />);

const stitch = { strokeDasharray: '5 5', strokeWidth: 1.6 } as const;

const SPECS: Record<ArtKind, (variant: string) => Spec> = {
  tshirt: (v) => ({
    shapes: [TEE],
    zoom: '110 60 180 225',
    details: (x) => (
      <g fill="none">
        <path d={x.back ? 'M132 92 Q200 108 268 92' : 'M132 92 Q200 130 268 92'} stroke={x.dark} strokeWidth={7} />
        <path d="M114 418 L286 418" stroke={x.line} fill="none" {...stitch} />
        <path d="M130 150 Q150 260 138 380" stroke={x.light} strokeWidth={5} opacity={0.25} />
        {v === 'graphic' && !x.back && (
          <g>
            <circle cx="200" cy="250" r="38" fill="none" stroke={x.gold} strokeWidth={4} />
            <text x="200" y="262" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="34" fill={x.gold} stroke="none">Y</text>
          </g>
        )}
        {v === 'henley' && !x.back && (<g><path d="M200 112 L200 190" stroke={x.line} strokeWidth={1.4} />{buttons(x, [135, 160, 185])}</g>)}
        {(v === 'crew-neck' || v === 'striped') && !x.back && <rect x="246" y="190" width="26" height="12" rx="2" fill={x.gold} opacity={0.9} stroke="none" />}
      </g>
    ),
  }),
  polo: () => ({
    shapes: [TEE],
    zoom: '110 60 180 225',
    details: (x) => (
      <g>
        {!x.back && (<>
          <path d="M132 92 L198 122 L182 150 L124 112 Z" fill={x.light} stroke={x.line} strokeWidth={1.5} />
          <path d="M268 92 L202 122 L218 150 L276 112 Z" fill={x.light} stroke={x.line} strokeWidth={1.5} />
          <path d="M200 122 L200 196" stroke={x.line} strokeWidth={1.5} />
          {buttons(x, [145, 175])}
        </>)}
        {x.back && <path d="M132 92 Q200 112 268 92 L268 104 Q200 126 132 104 Z" fill={x.light} stroke={x.line} />}
        <path d="M88 150 L52 202" stroke={x.dark} strokeWidth={6} opacity={0.5} />
        <path d="M312 150 L348 202" stroke={x.dark} strokeWidth={6} opacity={0.5} />
      </g>
    ),
  }),
  shirt: (v) => ({
    shapes: [SHIRT],
    zoom: '110 60 180 225',
    details: (x) => (
      <g>
        {!x.back ? (<>
          <path d="M134 88 L200 128 L176 158 L124 108 Z" fill={x.light} stroke={x.line} strokeWidth={1.5} />
          <path d="M266 88 L200 128 L224 158 L276 108 Z" fill={x.light} stroke={x.line} strokeWidth={1.5} />
          <path d="M200 128 L200 432" stroke={x.line} strokeWidth={1.4} />
          {buttons(x, [176, 226, 276, 326, 376])}
          {v !== 'formal' && <g><rect x="226" y="204" width="42" height="48" rx="4" fill="none" stroke={x.line} strokeWidth={1.4} /><path d="M226 218 L268 218" stroke={x.line} /></g>}
        </>) : (
          <path d="M134 88 Q200 112 266 88 L266 102 Q200 128 134 102 Z M118 150 Q200 180 282 150" fill={x.light} stroke={x.line} strokeWidth={1.4} />
        )}
        <path d="M46 330 L90 342 L86 364 L42 352 Z" fill={x.dark} opacity={0.5} />
        <path d="M354 330 L310 342 L314 364 L358 352 Z" fill={x.dark} opacity={0.5} />
        <path d="M116 420 L284 420" stroke={x.line} fill="none" {...stitch} />
        <path d="M122 140 Q140 270 130 400" stroke={x.light} strokeWidth={6} opacity={0.22} fill="none" />
      </g>
    ),
  }),
  kurta: () => ({
    shapes: [KURTA],
    zoom: '110 60 180 225',
    details: (x) => (
      <g fill="none">
        <path d="M146 70 Q200 98 254 70 L254 86 Q200 114 146 86 Z" fill={x.light} stroke={x.line} strokeWidth={1.5} />
        {!x.back && (<>
          <path d="M194 100 L194 262 M206 100 L206 262" stroke={x.gold} strokeWidth={2} />
          {buttons(x, [128, 168, 208, 248])}
          <path d="M140 400 Q150 410 150 440" stroke={x.line} strokeWidth={1.3} />
        </>)}
        <path d="M114 466 L286 466" stroke={x.gold} strokeWidth={3} opacity={0.8} />
        <path d="M114 428 L116 480 M286 428 L286 480" stroke={x.line} strokeWidth={1.4} />
      </g>
    ),
  }),
  nehru: () => ({
    shapes: ['M138 76 L200 122 L200 452 L122 452 L120 190 Z', 'M262 76 L200 122 L200 452 L278 452 L280 190 Z'],
    zoom: '110 60 180 225',
    under: (x) => (
      <g>
        <path d={KURTA} fill="#eadfc8" stroke="#bfae8d" strokeWidth={2} strokeLinejoin="round" />
        <path d="M146 70 Q200 98 254 70 L254 84 Q200 112 146 84 Z" fill="#f4ecdb" stroke="#bfae8d" />
        <rect x="116" y="452" width="168" height="28" fill="#eadfc8" stroke="#bfae8d" />
        <path d="M200 100 L200 122" stroke={x.gold} />
      </g>
    ),
    details: (x) => (
      <g>
        <path d="M200 122 L200 452" stroke={x.line} strokeWidth={1.4} />
        {buttons({ ...x, light: x.gold }, [170, 220, 270, 320, 370, 420])}
        <path d="M126 440 L196 440 M204 440 L274 440" stroke={x.line} fill="none" {...stitch} />
      </g>
    ),
  }),
  jeans: (v) => {
    const slim = v === 'slim' || v === 'tapered';
    const d = slim
      ? 'M128 48 L272 48 L286 462 L216 462 L200 196 L184 462 L114 462 Z'
      : v === 'relaxed' || v === 'bootcut' ? 'M118 48 L282 48 L312 462 L220 462 L200 196 L180 462 L88 462 Z' : 'M122 48 L278 48 L298 462 L214 462 L200 196 L186 462 L102 462 Z';
    return {
      shapes: [d],
      zoom: '100 30 200 250',
      details: (x) => (
        <g fill="none">
          <rect x="122" y="48" width="156" height="22" fill={x.dark} opacity={0.55} stroke="none" />
          <path d="M200 70 L200 196 M200 70 Q178 100 190 150" stroke={x.line} fill="none" {...stitch} />
          <path d="M132 76 Q152 96 168 82 M268 76 Q248 96 232 82" stroke={x.line} fill="none" {...stitch} />
          <rect x="196" y="48" width="10" height="22" rx="2" fill={x.gold} stroke="none" />
          <circle cx="200" cy="59" r="3.5" fill={x.gold} stroke="none" />
          {v === 'ripped' && <path d="M130 300 L170 304 M134 308 L164 312" stroke={x.light} strokeWidth={4} />}
          <path d="M112 450 L186 450 M214 450 L292 450" stroke={x.line} fill="none" {...stitch} />
        </g>
      ),
    };
  },
  trousers: (v) => {
    const jog = v === 'joggers';
    const d = jog
      ? 'M124 48 L276 48 L298 380 Q296 430 268 456 L214 456 L200 196 L186 456 L132 456 Q104 430 102 380 Z'
      : v === 'cargo' || v === 'pleated' ? 'M120 48 L280 48 L300 462 L214 462 L200 196 L186 462 L100 462 Z' : 'M130 48 L270 48 L284 462 L214 462 L200 196 L186 462 L116 462 Z';
    return {
      shapes: [d],
      zoom: '100 30 200 250',
      details: (x) => (
        <g fill="none">
          <rect x="118" y="48" width="164" height="20" fill={x.dark} opacity={0.5} stroke="none" />
          {[142, 172, 228, 258].map((px) => <rect key={px} x={px - 3} y="44" width="6" height="30" rx="2" fill={x.dark} stroke="none" opacity={0.7} />)}
          <path d="M200 68 L200 196" stroke={x.line} strokeWidth={1.4} />
          {!jog && <path d="M158 80 L150 456 M242 80 L250 456" stroke={x.light} strokeWidth={2} opacity={0.4} />}
          {v === 'pleated' && <path d="M172 70 L168 150 M228 70 L232 150" stroke={x.line} strokeWidth={1.4} />}
          {v === 'cargo' && (<g stroke={x.line} strokeWidth={1.4}><rect x="104" y="250" width="44" height="64" rx="4" fill={x.dark} fillOpacity={0.18} /><rect x="252" y="250" width="44" height="64" rx="4" fill={x.dark} fillOpacity={0.18} /></g>)}
          {jog && <path d="M104 420 Q200 436 296 420" stroke={x.dark} strokeWidth={14} opacity={0.55} />}
          <path d="M132 70 L168 76 M268 70 L232 76" stroke={x.line} strokeWidth={1.4} />
        </g>
      ),
    };
  },
  jacket: (v) => ({
    shapes: ['M132 84 L84 104 L46 340 L96 352 L118 190 L118 436 L282 436 L282 190 L304 352 L354 340 L316 104 L268 84 Q200 112 132 84 Z'],
    zoom: '110 60 180 225',
    details: (x) => {
      const rib = v === 'bomber' || v === 'quilted';
      return (
        <g fill="none">
          {rib && <path d="M118 436 L282 436 L282 418 L118 418 Z" fill={x.dark} stroke="none" opacity={0.7} />}
          {rib && <path d="M46 340 L96 352 L92 372 L42 360 Z M354 340 L304 352 L308 372 L358 360 Z" fill={x.dark} stroke="none" opacity={0.7} />}
          {v === 'blazer' ? (<>
            <path d="M132 84 L200 250 L268 84 L240 84 L200 160 L160 84 Z" fill={x.light} stroke={x.line} strokeWidth={1.5} />
            <path d="M200 250 L200 436" stroke={x.line} strokeWidth={1.4} />
            {buttons(x, [276, 316], 196)}
            <rect x="130" y="320" width="48" height="8" rx="2" stroke={x.line} />
          </>) : (<>
            <path d={rib ? 'M132 84 Q200 112 268 84 L268 108 Q200 136 132 108 Z' : 'M132 84 L200 130 L168 164 L124 108 Z M268 84 L200 130 L232 164 L276 108 Z'} fill={rib ? x.dark : x.light} stroke={x.line} strokeWidth={1.5} />
            <path d="M200 130 L200 436" stroke={x.line} strokeWidth={2} />
            {v === 'bomber' || v === 'quilted' || v === 'faux-leather' ? <rect x="195" y="140" width="10" height="26" rx="3" fill={x.gold} stroke="none" /> : buttons(x, [176, 226, 276, 326, 376])}
            <rect x="130" y="270" width="52" height="46" rx="5" stroke={x.line} strokeWidth={1.5} /><rect x="218" y="270" width="52" height="46" rx="5" stroke={x.line} strokeWidth={1.5} />
          </>)}
          {v === 'quilted' && [200, 250, 300, 350, 400].map((y) => <path key={y} d={`M120 ${y} Q200 ${y + 14} 280 ${y}`} stroke={x.light} strokeWidth={2} opacity={0.35} />)}
          {v === 'faux-leather' && <path d="M130 130 Q150 250 140 400" stroke={x.light} strokeWidth={8} opacity={0.2} />}
        </g>
      );
    },
  }),
  watch: () => ({
    shapes: [],
    zoom: '90 100 220 275',
    custom: (x) => {
      const metal = x.variant === 'gold' ? '#d2ac72' : '#c9ccd0';
      const face = luminance(x.c) > 0.6 ? '#24211d' : '#f4efe4';
      return (
        <g>
          <path d="M168 30 L232 30 L240 160 L160 160 Z M160 340 L240 340 L232 470 L168 470 Z" fill={x.c} stroke={x.line} strokeWidth={2} />
          {[388, 408, 428].map((y) => <circle key={y} cx="200" cy={y} r="4" fill={x.dark} />)}
          <path d="M170 60 L230 60 M168 120 L232 120" stroke={x.line} fill="none" {...stitch} />
          <circle cx="200" cy="250" r="96" fill={metal} stroke={shade(metal, -0.3)} strokeWidth={3} />
          <circle cx="200" cy="250" r="80" fill={face} stroke={shade(metal, -0.3)} strokeWidth={2} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6; return <line key={i} x1={200 + Math.sin(a) * 66} y1={250 - Math.cos(a) * 66} x2={200 + Math.sin(a) * 74} y2={250 - Math.cos(a) * 74} stroke={face === '#24211d' ? '#f4efe4' : '#24211d'} strokeWidth={i % 3 === 0 ? 4 : 2} />;
          })}
          <line x1="200" y1="250" x2="200" y2="204" stroke={face === '#24211d' ? '#f4efe4' : '#24211d'} strokeWidth={4} strokeLinecap="round" />
          <line x1="200" y1="250" x2="232" y2="262" stroke={face === '#24211d' ? '#f4efe4' : '#24211d'} strokeWidth={3} strokeLinecap="round" />
          <line x1="200" y1="250" x2="170" y2="290" stroke="#c0392b" strokeWidth={1.5} />
          <circle cx="200" cy="250" r="5" fill={metal} />
          <rect x="296" y="244" width="14" height="12" rx="3" fill={metal} stroke={shade(metal, -0.3)} />
        </g>
      );
    },
  }),
  belt: () => ({
    shapes: [],
    zoom: '20 150 360 200',
    custom: (x) => (
      <g transform="rotate(-8 200 250)">
        <rect x="76" y="228" width="300" height="44" rx="6" fill={x.c} stroke={x.line} strokeWidth={2} />
        <path d="M84 236 L368 236 M84 264 L368 264" stroke={x.light} fill="none" {...stitch} opacity={0.7} />
        {[270, 295, 320, 345].map((cx) => <circle key={cx} cx={cx} cy="250" r="4.5" fill={x.dark} />)}
        <rect x="40" y="206" width="84" height="88" rx="10" fill="none" stroke={x.gold} strokeWidth={11} />
        <rect x="40" y="206" width="84" height="88" rx="10" fill="none" stroke={shade(x.gold, 0.35)} strokeWidth={2} />
        <path d="M82 250 L150 250" stroke={x.gold} strokeWidth={7} strokeLinecap="round" />
        <rect x="140" y="220" width="22" height="60" rx="4" fill={x.dark} stroke={x.line} />
      </g>
    ),
  }),
  wallet: () => ({
    shapes: [],
    zoom: '60 100 280 350',
    custom: (x) => (
      <g>
        <rect x="108" y="140" width="190" height="62" rx="10" fill={x.light} stroke={x.line} />
        <rect x="76" y="176" width="248" height="190" rx="22" fill={x.c} stroke={x.line} strokeWidth={2} />
        <rect x="90" y="190" width="220" height="162" rx="14" fill="none" stroke={x.light} {...stitch} opacity={0.8} />
        <path d="M76 250 L324 250" stroke={x.dark} strokeWidth={2} opacity={0.7} />
        <circle cx="262" cy="320" r="16" fill="none" stroke={x.gold} strokeWidth={2.5} />
        <text x="262" y="327" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="19" fill={x.gold}>Y</text>
        <path d="M100 180 Q200 160 300 180" stroke={x.light} strokeWidth={5} opacity={0.2} fill="none" />
      </g>
    ),
  }),
  cap: () => ({
    shapes: [],
    zoom: '60 100 280 350',
    custom: (x) => (
      <g>
        <path d="M92 312 Q84 150 200 138 Q316 150 308 312 Z" fill={x.c} stroke={x.line} strokeWidth={2} />
        <path d="M200 138 Q150 220 154 312 M200 138 Q250 220 246 312" fill="none" stroke={x.dark} strokeWidth={1.6} opacity={0.6} />
        <circle cx="200" cy="140" r="7" fill={x.dark} />
        <path d="M80 312 Q200 346 372 330 Q350 384 200 376 Q100 372 80 312 Z" fill={x.dark} stroke={x.line} strokeWidth={2} />
        <path d="M92 312 Q200 330 308 312" fill="none" stroke={x.light} strokeWidth={2} opacity={0.5} />
        <circle cx="200" cy="250" r="20" fill="none" stroke={x.gold} strokeWidth={2.5} />
        <text x="200" y="258" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="22" fill={x.gold}>Y</text>
      </g>
    ),
  }),
  sunglasses: () => ({
    shapes: [],
    zoom: '20 140 360 230',
    custom: (x) => {
      const lens = <linearGradient id={`${x.uid}lens`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4b4944" /><stop offset="1" stopColor="#171512" /></linearGradient>;
      const L = 'M52 206 Q52 186 82 186 L166 186 Q192 190 192 222 Q190 290 126 292 Q62 292 52 238 Z';
      return (
        <g>
          <defs>{lens}</defs>
          <path d="M52 200 L22 190 M348 200 L378 190" stroke={x.c} strokeWidth={9} strokeLinecap="round" />
          <path d={L} fill={`url(#${x.uid}lens)`} stroke={x.c} strokeWidth={9} strokeLinejoin="round" />
          <path d={L} fill={`url(#${x.uid}lens)`} stroke={x.c} strokeWidth={9} strokeLinejoin="round" transform="translate(400 0) scale(-1 1)" />
          <path d="M192 212 Q200 198 208 212" fill="none" stroke={x.c} strokeWidth={9} strokeLinecap="round" />
          <path d="M78 206 L120 206 M280 206 L322 206" stroke="#fff" strokeWidth={5} opacity={0.2} strokeLinecap="round" />
        </g>
      );
    },
  }),
  backpack: () => ({
    shapes: [],
    zoom: '60 60 280 350',
    custom: (x) => (
      <g>
        <path d="M166 100 Q200 36 234 100" fill="none" stroke={x.dark} strokeWidth={13} strokeLinecap="round" />
        <path d="M112 150 Q112 94 200 94 Q288 94 288 150 L300 422 Q300 452 268 452 L132 452 Q100 452 100 422 Z" fill={x.c} stroke={x.line} strokeWidth={2} />
        <path d="M108 146 Q60 220 74 380 Q86 400 104 390 Z M292 146 Q340 220 326 380 Q314 400 296 390 Z" fill={x.dark} opacity={0.75} />
        <path d="M120 150 Q200 120 280 150" fill="none" stroke={x.light} {...stitch} />
        <rect x="136" y="292" width="128" height="120" rx="14" fill={x.dark} fillOpacity={0.4} stroke={x.line} strokeWidth={1.5} />
        <path d="M148 312 L252 312" stroke={x.gold} strokeWidth={3} strokeLinecap="round" />
        <rect x="190" y="304" width="20" height="16" rx="4" fill={x.gold} />
        <circle cx="200" cy="230" r="17" fill="none" stroke={x.gold} strokeWidth={2.5} />
        <text x="200" y="237" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="19" fill={x.gold}>Y</text>
      </g>
    ),
  }),
  socks: () => ({
    shapes: [],
    zoom: '60 40 280 350',
    custom: (x) => {
      const sock = (dx: number, rot: number) => (
        <g transform={`translate(${dx} 0) rotate(${rot} 200 250)`}>
          <path d="M142 50 L222 50 L222 290 Q222 330 262 352 Q312 380 290 424 Q262 446 190 436 Q130 424 134 360 Q142 320 142 290 Z" fill={x.c} stroke={x.line} strokeWidth={2} strokeLinejoin="round" />
          <rect x="142" y="50" width="80" height="44" fill={x.dark} opacity={0.65} />
          <path d="M142 66 L222 66 M142 80 L222 80" stroke={x.light} strokeWidth={3} opacity={0.7} />
          <path d="M134 360 Q150 330 176 340 Q170 380 180 436 Q130 424 134 360Z" fill={x.dark} opacity={0.5} />
          <path d="M262 352 Q312 380 290 424 Q270 440 236 438 Q268 400 262 352Z" fill={x.dark} opacity={0.5} />
        </g>
      );
      return <g>{sock(-40, -4)}{sock(56, 5)}</g>;
    },
  }),
  fragrance: () => ({
    shapes: [],
    zoom: '80 80 240 300',
    custom: (x) => (
      <g>
        <rect x="180" y="150" width="40" height="40" fill={x.dark} />
        <rect x="168" y="86" width="64" height="72" rx="8" fill={x.gold} stroke={shade(x.gold, -0.3)} strokeWidth={2} />
        <path d="M176 100 L176 150" stroke="#fff" strokeWidth={4} opacity={0.4} />
        <rect x="124" y="186" width="152" height="240" rx="18" fill={x.c} fillOpacity={0.88} stroke={x.line} strokeWidth={2.5} />
        <rect x="136" y="198" width="22" height="216" rx="10" fill="#fff" opacity={0.28} />
        <rect x="156" y="262" width="88" height="96" rx="6" fill="#f6efe0" stroke={x.gold} />
        <text x="200" y="306" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="22" fill="#422817">YNOT</text>
        <text x="200" y="330" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fill="#6b4226">EAU DE PARFUM</text>
      </g>
    ),
  }),
  sling: () => ({
    shapes: [],
    zoom: '60 40 280 350',
    custom: (x) => (
      <g>
        <path d="M126 160 Q96 50 200 36 Q304 50 274 160" fill="none" stroke={x.dark} strokeWidth={15} strokeLinecap="round" />
        <path d="M112 186 Q112 156 142 156 L258 156 Q288 156 288 186 L288 346 Q288 376 258 376 L142 376 Q112 376 112 346 Z" fill={x.c} stroke={x.line} strokeWidth={2} />
        <path d="M112 186 L288 186 L288 252 Q200 296 112 252 Z" fill={x.dark} opacity={0.5} stroke={x.line} />
        <circle cx="200" cy="268" r="9" fill={x.gold} stroke={shade(x.gold, -0.3)} />
        <path d="M126 320 L274 320" stroke={x.light} fill="none" {...stitch} opacity={0.7} />
        <rect x="170" y="150" width="60" height="12" rx="4" fill={x.gold} />
      </g>
    ),
  }),
  keychain: () => ({
    shapes: [],
    zoom: '90 40 220 275',
    custom: (x) => (
      <g>
        <circle cx="200" cy="100" r="46" fill="none" stroke="#c9ccd0" strokeWidth={9} />
        <circle cx="200" cy="100" r="46" fill="none" stroke="#fff" strokeWidth={2} opacity={0.6} />
        <rect x="190" y="136" width="20" height="34" rx="6" fill="#c9ccd0" stroke="#8a8d91" />
        <path d="M162 168 L238 168 L250 400 Q250 424 226 424 L174 424 Q150 424 150 400 Z" fill={x.c} stroke={x.line} strokeWidth={2} />
        <path d="M172 184 L228 184 L236 404 L164 404 Z" fill="none" stroke={x.light} {...stitch} opacity={0.8} />
        <circle cx="200" cy="210" r="11" fill={x.gold} stroke={shade(x.gold, -0.3)} />
        <text x="200" y="320" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="34" fill={x.gold}>Y</text>
      </g>
    ),
  }),
};

function PatternDefs({ id, pattern, c }: { id: string; pattern: Pattern; c: string }) {
  const dark = luminance(c) < 0.38;
  const ink = dark ? shade(c, 0.55) : shade(c, -0.4);
  switch (pattern) {
    case 'check':
      return (<pattern id={id} width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="none" /><path d="M0 15 H30 M15 0 V30" stroke={ink} strokeWidth="6" opacity="0.28" /><path d="M0 3 H30 M3 0 V30" stroke={ink} strokeWidth="1.5" opacity="0.5" /></pattern>);
    case 'stripe':
      return (<pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse"><rect width="5" height="16" fill={ink} opacity="0.5" /></pattern>);
    case 'print':
      return (<pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="5" fill="#e9c46a" opacity="0.85" /><path d="M28 8 Q40 14 34 28 Q22 22 28 8Z" fill="#5f7d4f" opacity="0.85" /><circle cx="14" cy="32" r="3.5" fill="#c0504d" opacity="0.8" /><path d="M32 36 L40 40 L34 42Z" fill="#f4f1ea" opacity="0.85" /></pattern>);
    case 'denim':
      return (<pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6 L6 0" stroke={dark ? '#fff' : '#1c2a44'} strokeWidth="1.1" opacity="0.2" /></pattern>);
    case 'textured':
      return (<pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill={ink} opacity="0.22" /><circle cx="6" cy="6" r="0.8" fill={ink} opacity="0.18" /></pattern>);
    default:
      return null;
  }
}

export interface ProductArtProps {
  art: ArtKind;
  color: string;
  pattern?: Pattern;
  view?: ImageView;
  variant?: string;
  label: string;
  className?: string;
}

export default function ProductArt({ art, color, pattern = 'solid', view = 'front', variant = '', label, className }: ProductArtProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const spec = SPECS[art](variant);
  const dark = shade(color, -0.22);
  const light = shade(color, 0.22);
  const line = shade(color, luminance(color) > 0.7 ? -0.3 : -0.38);
  const gold = '#c39a61';
  const ctx: Ctx = { c: color, dark, light, line, back: view === 'back', variant, gold, uid };
  const fabric = spec.shapes.length > 0;
  const zoomed = view === 'detail';
  const viewBox = zoomed ? spec.zoom ?? '80 60 240 300' : '0 0 400 500';
  const bgA = view === 'styled' ? '#dcc7a6' : view === 'back' ? '#f4ecdd' : '#efe4d1';
  const bgB = view === 'styled' ? '#c9b08a' : view === 'back' ? '#eadcc6' : '#e6d6bd';

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label} className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}bg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={bgA} /><stop offset="1" stopColor={bgB} /></linearGradient>
        <linearGradient id={`${uid}sh`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.2" /><stop offset="0.55" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.14" /></linearGradient>
        <clipPath id={`${uid}clip`}>{spec.shapes.map((d, i) => <path key={i} d={d} />)}</clipPath>
        {fabric && <PatternDefs id={`${uid}pat`} pattern={pattern} c={color} />}
      </defs>
      <rect x="-200" y="-200" width="800" height="900" fill={`url(#${uid}bg)`} />
      {view === 'styled' && (
        <g>
          <rect x="70" y="40" width="260" height="440" rx="130" fill="#f1e5cf" opacity="0.7" />
          <path d="M-10 500 Q30 400 90 380 Q70 440 110 500Z" fill="#7f8f5f" opacity="0.5" />
          <path d="M410 500 Q380 420 320 400 Q340 450 300 500Z" fill="#7f8f5f" opacity="0.45" />
        </g>
      )}
      <ellipse cx="200" cy="474" rx="118" ry="9" fill="#422817" opacity="0.13" />
      {spec.under?.(ctx)}
      {fabric && (
        <g strokeLinejoin="round">
          {spec.shapes.map((d, i) => <path key={i} d={d} fill={color} stroke={line} strokeWidth={2} />)}
          {pattern !== 'solid' && <rect x="0" y="0" width="400" height="500" fill={`url(#${uid}pat)`} clipPath={`url(#${uid}clip)`} />}
          <rect x="0" y="0" width="400" height="500" fill={`url(#${uid}sh)`} clipPath={`url(#${uid}clip)`} />
          {spec.details?.(ctx)}
        </g>
      )}
      {!fabric && spec.custom?.(ctx)}
    </svg>
  );
}
