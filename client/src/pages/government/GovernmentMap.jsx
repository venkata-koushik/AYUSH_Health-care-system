const STATE_TILES = [
  ["Jammu and Kashmir", 132, 21],
  ["Himachal Pradesh", 151, 46],
  ["Punjab", 111, 57],
  ["Uttarakhand", 171, 64],
  ["Haryana", 130, 79],
  ["Delhi", 151, 87],
  ["Rajasthan", 85, 96],
  ["Uttar Pradesh", 170, 103],
  ["Bihar", 230, 111],
  ["Sikkim", 273, 102],
  ["Assam", 292, 125],
  ["Arunachal Pradesh", 322, 102],
  ["Nagaland", 320, 139],
  ["Manipur", 313, 155],
  ["Meghalaya", 285, 146],
  ["Tripura", 286, 169],
  ["Mizoram", 312, 177],
  ["West Bengal", 256, 145],
  ["Jharkhand", 225, 145],
  ["Madhya Pradesh", 152, 146],
  ["Gujarat", 91, 145],
  ["Chhattisgarh", 190, 171],
  ["Odisha", 235, 175],
  ["Maharashtra", 135, 190],
  ["Telangana", 185, 202],
  ["Andhra Pradesh", 213, 214],
  ["Karnataka", 158, 228],
  ["Goa", 122, 224],
  ["Kerala", 157, 269],
  ["Tamil Nadu", 190, 263],
  ["Puducherry", 205, 265],
];

const stateKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const colourFor = (value, max) => {
  if (!value) return "#e6edf3";
  const strength = max ? value / max : 0;
  if (strength > 0.72) return "#a51d3d";
  if (strength > 0.42) return "#e55d3c";
  if (strength > 0.17) return "#f4ae4d";
  return "#72b8a5";
};

export default function GovernmentMap({
  stateIntensity,
  selectedState,
  onSelectState,
}) {
  const counts = Object.fromEntries(
    (stateIntensity || []).map((item) => [
      stateKey(item.state),
      item.consultations,
    ]),
  );
  const max = Math.max(0, ...Object.values(counts));
  return (
    <section className="india-map-card">
      <div className="panel-title">
        <div>
          <p>Geographic surveillance</p>
          <h2>India consultation intensity</h2>
        </div>
        <span className="map-legend">
          Low <i /> High
        </span>
      </div>
      <svg
        className="india-map"
        viewBox="55 5 315 290"
        role="img"
        aria-label="Interactive India consultation intensity map"
      >
        <path
          d="M126 25 L167 45 L184 84 L247 98 L277 127 L251 154 L240 201 L213 224 L203 275 L161 282 L144 237 L113 212 L98 159 L111 111 Z"
          fill="#f6f9fb"
          stroke="#c9d7e1"
          strokeWidth="2"
        />
        {STATE_TILES.map(([state, x, y]) => {
          const count = counts[stateKey(state)] || 0;
          const selected = stateKey(selectedState) === stateKey(state);
          return (
            <g
              key={state}
              className="map-tile"
              onClick={() => onSelectState(state)}
              tabIndex="0"
              role="button"
              aria-label={`${state}: ${count} consultations`}
            >
              <rect
                x={x}
                y={y}
                width="27"
                height="19"
                rx="4"
                fill={colourFor(count, max)}
                stroke={selected ? "#173f5f" : "#ffffff"}
                strokeWidth={selected ? "3" : "1"}
              />
              <title>{`${state}: ${count} consultation${count === 1 ? "" : "s"}`}</title>
              <text x={x + 13.5} y={y + 12.5} textAnchor="middle">
                {state
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 3)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="map-caption">
        Select a state to filter the full dashboard. State tiles use
        consultation volume, not disease prevalence.
      </p>
    </section>
  );
}
