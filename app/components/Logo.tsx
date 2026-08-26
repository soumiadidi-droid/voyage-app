export function Logo({ height = 32 }: { height?: number }) {
  const width = (560 / 90) * height;
  return (
    <svg
      viewBox="0 0 560 90"
      height={height}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="LVE — Le Voyage des Émotions"
    >
      <text
        x="280"
        y="64"
        textAnchor="middle"
        className="tracking-[0.15em]"
        fontFamily="'Cormorant Garamond', serif"
        fontWeight="300"
        fontSize="58"
        fill="currentColor"
      >
        LVE
      </text>
      <line
        x1="216"
        y1="76"
        x2="344"
        y2="76"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.45"
      />
    </svg>
  );
}
