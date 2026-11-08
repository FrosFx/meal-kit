/** Original, lightweight vector artwork; no third-party image requests. */
export default function MealIllustration() {
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      role="img"
      aria-label="Ilustracija svežeg obroka sa povrćem u keramičkom tanjiru"
    >
      <defs>
        <radialGradient id="ceramic">
          <stop stopColor="#fffdf5" />
          <stop offset=".8" stopColor="#f3efdf" />
          <stop offset="1" stopColor="#d8d2b9" />
        </radialGradient>
        <linearGradient id="avocado" x2="1" y2="1">
          <stop stopColor="#d8eb8b" />
          <stop offset="1" stopColor="#8bb441" />
        </linearGradient>
        <linearGradient id="carrot" x2="1" y2="1">
          <stop stopColor="#ffbc64" />
          <stop offset="1" stopColor="#df622f" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow
            dx="0"
            dy="15"
            stdDeviation="14"
            floodColor="#132e20"
            floodOpacity=".2"
          />
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <circle cx="300" cy="300" r="241" fill="url(#ceramic)" />
        <circle cx="300" cy="300" r="219" stroke="#fffdf6" strokeWidth="3" />
        <circle cx="300" cy="300" r="193" fill="#e6dfc7" />
        <circle cx="300" cy="300" r="183" fill="#d8d6ad" />
        {Array.from({ length: 15 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 24} 300 300)`}>
            <path
              d="M290 320Q172 293 168 208Q268 171 310 290Z"
              fill={i % 2 ? "#456c35" : "#628843"}
            />
            <path d="M298 299L184 218" stroke="#9bad68" strokeWidth="2" />
          </g>
        ))}
        <g transform="rotate(-32 300 300)">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={205}
              y={180 + i * 30}
              width="176"
              height="27"
              rx="13"
              fill="url(#carrot)"
              stroke="#f8c889"
              strokeWidth="2"
            />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${228 + i * 38} 184l-8 19m8 11-8 17m8 13-8 18m8 12-8 18m8 12-8 18`}
              stroke="#a84b24"
              strokeWidth="4"
              opacity=".55"
            />
          ))}
        </g>
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            transform={`rotate(${i * 13} 352 352)`}
            d="M347 243C435 265 465 365 388 429L374 407C425 352 404 300 340 275Z"
            fill="url(#avocado)"
            stroke="#46703a"
            strokeWidth="5"
          />
        ))}
        {[
          [174, 315],
          [203, 371],
          [260, 415],
          [171, 264],
          [379, 183],
          [415, 230],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="23" fill="#d74c31" />
            <circle cx={x} cy={y} r="17" fill="#ef7850" />
            <path
              d={`M${x - 10} ${y}h20M${x} ${y - 10}v20`}
              stroke="#ffc78b"
              strokeWidth="3"
            />
          </g>
        ))}
        {[
          [226, 177],
          [311, 384],
          [194, 341],
          [360, 204],
          [246, 362],
          [290, 188],
          [321, 431],
          [407, 287],
        ].map(([x, y], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width="16"
            height="16"
            rx="3"
            transform={`rotate(${i * 17} ${x} ${y})`}
            fill="#fffae9"
          />
        ))}
        {Array.from({ length: 26 }, (_, i) => (
          <ellipse
            key={i}
            cx={220 + ((i * 47) % 175)}
            cy={200 + ((i * 61) % 210)}
            rx="3"
            ry="1.5"
            transform={`rotate(${i * 37} ${220 + ((i * 47) % 175)} ${200 + ((i * 61) % 210)})`}
            fill="#fbf0ca"
          />
        ))}
        <path
          d="M275 301Q239 252 269 244Q297 241 295 290Q310 246 335 262Q352 291 293 307Z"
          fill="#315e35"
        />
      </g>
    </svg>
  );
}
