import type { GroundTruth, Point, Track } from "../hooks/useRadarData";

export function extractState(
  time: Date,
  trajectory: Track | GroundTruth,
): Point {
  const state = trajectory.points.reduce((closest, point) => {
    const currentDiff = Math.abs(
      new Date(point.time).getTime() - time.getTime(),
    );
    const closestDiff = Math.abs(
      new Date(closest.time).getTime() - time.getTime(),
    );
    return currentDiff < closestDiff ? point : closest;
  });
  return {
    lat: state.lat,
    lon: state.lon,
    alt: state.alt,
  };
}

export function linSpace(start: number, stop: number, n: number): number[] {
  const step = (stop - start) / (n - 1);
  return Array.from({ length: n }, (_, i) => start + step * i);
}

export function valueCounts<T extends string | number | symbol>(
  arr: T[],
): Record<T, number> {
  return arr.reduce(
    (acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    },
    {} as Record<T, number>,
  );
}
