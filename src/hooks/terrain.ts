import type { Point } from "./useRadarData";

const BASE_URL = "http://localhost:8000";

/** Terrain elevation [MASL] at (lat, lon) */
export async function fetchElevation(lat: number, lon: number): Promise<number> {
  const response = await fetch(`${BASE_URL}/elevation_at/${lat}_${lon}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch the elevation: ${response.status}`);
  }
  return (await response.json()) as number;
}

/** Terrain-aware line-of-sight distance [m] between two points */
export async function fetchLineOfSightDistance(
  p1: Point,
  p2: Point,
): Promise<number> {
  const response = await fetch(
    `${BASE_URL}/line_of_sight_distance/${p1.lat}_${p1.lon}_${p1.alt}/${p2.lat}_${p2.lon}_${p2.alt}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch the distance: ${response.status}`);
  }
  return (await response.json()) as number;
}
