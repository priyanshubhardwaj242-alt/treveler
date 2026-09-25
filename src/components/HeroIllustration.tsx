export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A1A1F" />
          <stop offset="55%" stopColor="#10242A" />
          <stop offset="100%" stopColor="#152E32" />
        </linearGradient>
        <radialGradient id="warmGlow" cx="78%" cy="72%" r="55%">
          <stop offset="0%" stopColor="#E8734A" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#D9A441" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#D9A441" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mtnFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B3238" />
          <stop offset="100%" stopColor="#132A2F" />
        </linearGradient>
        <linearGradient id="mtnNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E2126" />
          <stop offset="100%" stopColor="#0A1A1F" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#skyGrad)" />
      <rect width="1600" height="900" fill="url(#warmGlow)" />

      {/* stars */}
      {[...Array(40)].map((_, i) => {
        const x = (i * 97) % 1600;
        const y = (i * 53) % 260;
        return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 1.6 : 0.9} fill="#EFEAE0" opacity={0.15 + (i % 4) * 0.08} />;
      })}

      {/* far mountain range */}
      <path
        d="M0,560 L120,470 L230,540 L340,430 L470,530 L600,410 L730,520 L860,460 L1000,540 L1140,440 L1290,530 L1430,460 L1600,540 L1600,900 L0,900 Z"
        fill="url(#mtnFar)"
      />
      {/* near mountain range */}
      <path
        d="M0,650 L160,560 L300,630 L450,540 L610,640 L780,550 L950,650 L1120,560 L1290,650 L1450,570 L1600,640 L1600,900 L0,900 Z"
        fill="url(#mtnNear)"
      />

      {/* city skyline silhouette along the base */}
      <g fill="#081418">
        <rect x="40" y="700" width="60" height="200" />
        <rect x="110" y="650" width="40" height="250" />
        <rect x="160" y="720" width="70" height="180" />
        <rect x="245" y="600" width="50" height="300" />
        <rect x="305" y="680" width="45" height="220" />
        <rect x="900" y="660" width="55" height="240" />
        <rect x="965" y="600" width="40" height="300" />
        <rect x="1015" y="710" width="65" height="190" />
        <rect x="1090" y="640" width="45" height="260" />
        <rect x="1145" y="690" width="70" height="210" />
        <rect x="1225" y="610" width="42" height="290" />
        <rect x="1280" y="670" width="58" height="230" />
        <rect x="1350" y="630" width="46" height="270" />
      </g>
      {/* lit windows, sparse */}
      <g fill="#D9A441" opacity="0.5">
        {[...Array(26)].map((_, i) => {
          const buildingsX = [55, 120, 175, 260, 315, 915, 980, 1030, 1105, 1160, 1240, 1295, 1365];
          const bx = buildingsX[i % buildingsX.length] + (i % 3) * 8;
          const by = 720 + ((i * 37) % 150);
          return <rect key={i} x={bx} y={by} width="6" height="8" opacity={0.3 + (i % 3) * 0.2} />;
        })}
      </g>

      {/* flight-path arc: the route-optimization motif, echoed from the app UI */}
      <path
        d="M120,780 C 420,560 780,540 1180,300"
        fill="none"
        stroke="#E8734A"
        strokeWidth="2.5"
        strokeDasharray="2 12"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="120" cy="780" r="7" fill="#10242A" stroke="#EFEAE0" strokeWidth="2" />
      <circle cx="560" cy="590" r="6" fill="#E8734A" />
      <circle cx="900" cy="470" r="6" fill="#E8734A" />
      <g transform="translate(1180,300) rotate(-35)">
        <path d="M0,0 L20,6 L0,12 L4,6 Z" fill="#D9A441" />
      </g>
    </svg>
  );
}
