export default function RadarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.2"
      baseProfile="tiny"
      width="38.4"
      height="36.72"
      viewBox="36 11 160 153"
    >
      <circle
        cx="100"
        cy="100"
        r="60"
        strokeWidth="4"
        stroke="black"
        fill="rgb(128,224,255)"
        fillOpacity="1"
      />
      <g transform="translate(0,0)">
        <g transform="scale(1)">
          <path
            d="M72,95 l30,-25 0,25 30,-25 M70,70 c0,35 15,50 50,50"
            strokeWidth="3"
            stroke="black"
            fill="none"
          />
        </g>
      </g>
      <text
        x="170"
        y="40"
        textAnchor="start"
        fontSize="35"
        fontFamily="Arial"
        fontWeight="bold"
        dominantBaseline="middle"
        fill="black"
      >
        S
      </text>
    </svg>
  );
}
