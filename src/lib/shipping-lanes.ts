export const SHIPPING_LANES_GEOJSON = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      properties: { name: "Persian Gulf → Suez Canal", id: "pg-suez" },
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [50.5, 26.5], // Persian Gulf
          [56.5, 26.0], // Strait of Hormuz
          [58.5, 23.5], // Gulf of Oman
          [60.0, 20.0], // Arabian Sea
          [55.0, 15.0], // Gulf of Aden approach
          [48.0, 12.5], // Bab el-Mandeb
          [43.3, 12.6], // Red Sea south
          [38.0, 18.0], // Red Sea mid
          [35.5, 24.0], // Red Sea north
          [32.3, 30.0], // Suez Canal
          [32.0, 31.5], // Mediterranean entry
          [30.0, 33.0], // Eastern Med
          [15.0, 36.0], // Central Med
          [3.0, 36.5], // Western Med
          [-5.5, 36.0], // Strait of Gibraltar
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { name: "Persian Gulf → Cape of Good Hope", id: "pg-cape" },
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [50.5, 26.5],
          [56.5, 26.0],
          [60.0, 20.0],
          [55.0, 10.0],
          [50.0, 0.0],
          [45.0, -10.0],
          [40.0, -20.0],
          [30.0, -30.0],
          [18.5, -34.5], // Cape of Good Hope
          [10.0, -30.0],
          [0.0, -20.0],
          [-10.0, -5.0],
          [-20.0, 10.0],
          [-40.0, 30.0], // Atlantic
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { name: "West Africa → Atlantic", id: "wafrica-atlantic" },
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [3.0, 4.0], // Gulf of Guinea
          [0.0, 3.0],
          [-5.0, 5.0],
          [-15.0, 15.0],
          [-25.0, 25.0],
          [-40.0, 35.0],
          [-50.0, 38.0], // US East Coast approach
          [-70.0, 28.0], // Gulf of Mexico approach
          [-88.0, 27.0], // US Gulf
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { name: "Russia → Baltic → Europe", id: "russia-baltic" },
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [29.0, 60.0], // St. Petersburg
          [25.0, 59.5],
          [20.0, 58.0],
          [15.0, 56.0], // Baltic
          [12.0, 55.5], // Danish Straits
          [8.0, 56.0],
          [4.0, 54.0], // North Sea
          [1.0, 51.5], // English Channel
          [-5.0, 50.0],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { name: "SE Asia → Malacca → East Asia", id: "malacca-east" },
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [95.0, 5.0], // Indian Ocean
          [100.0, 2.5], // Malacca Strait
          [104.0, 1.3], // Singapore
          [107.0, 2.0],
          [110.0, 5.0],
          [114.0, 10.0], // South China Sea
          [117.0, 15.0],
          [120.0, 22.0], // Taiwan Strait
          [125.0, 30.0],
          [130.0, 33.0], // Japan
        ],
      },
    },
  ],
};
