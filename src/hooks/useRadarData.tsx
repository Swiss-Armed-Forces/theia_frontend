import { useEffect, useState } from "react";
import type { components } from "./schema";
import type { Feature, Polygon } from "geojson";
export type GeoJSONPolygon = Polygon;
export type GeoJSONFeature = Feature<Polygon>;
import memoize from "memoizee";
import stringify from "fast-json-stable-stringify";
// import createFetchClient from "openapi-fetch";
// import createClient from "openapi-react-query";

export type SituationalPicture =
  components["schemas"]["ExtrapolatedSituationalPicture"];
export type Radar = components["schemas"]["Radar-Input"];
export type Point = components["schemas"]["Point"];
export type Track = components["schemas"]["ExtrapolatedTrack"];
export type GroundTruth = components["schemas"]["ExtrapolatedGroundtruth"];

// const fetchClient = createFetchClient<paths>({
//   baseUrl: "http://localhost:8000",
// });
// export const backendApi = createClient(fetchClient);

const BASE_URL = "http://localhost:8000";
const DEFAULT_SITUATIONAL_PICTURE: SituationalPicture = {
  time: "1900-00-00T00:00:00",
  friendly_radars: [],
  enemy_tracks: [],
};
const DEFAULT_GROUND_TRUTH: GroundTruth = { target_id: -1, points: [] };

function generateTimeWindow(
  time: Date,
  secondsInPast: number,
  secondsInFuture: number,
): Date[] {
  const times: Date[] = [];
  for (let s = -secondsInPast; s <= secondsInFuture; s++) {
    times.push(new Date(time.getTime() + s * 1000));
  }
  return times;
}

export default function useRadarData(extrapolate: boolean) {
  const [time, setTime] = useState(new Date("2022-06-27T23:01:40"));
  const [isPaused, setIsPaused] = useState(true);
  const [redGroundTruth, setRedGroundTruth] = useState([
    DEFAULT_GROUND_TRUTH,
  ] as GroundTruth[]);
  const [blueSituationalPicture, setBlueSituationalPicture] = useState(
    DEFAULT_SITUATIONAL_PICTURE,
  );
  const [blueCoverages, setBlueCoverages] = useState([] as GeoJSONFeature[]);

  const targetAlt = 10000;
  const azimuthResDegree = 2;

  const secondsInPast = 60;
  const secondsInFuture = extrapolate ? 60 : 0;

  const refreshPeriodSeconds = 1;

  // const time = new Date("2022-06-27T23:01:40");

  useEffect(() => {
    Promise.all(
      blueSituationalPicture.friendly_radars.map((radar) =>
        calculateMonostaticCoverage(radar, targetAlt, azimuthResDegree),
      ),
    ).then((coverages) => {
      setBlueCoverages(coverages);
    });
  }, [blueSituationalPicture]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        fetchSimulationTime().then((time) => {
          setTime(time);
        });
      }
      fetchIsPaused().then((isPausedNew) => {
        setIsPaused(isPausedNew);
      });
    }, refreshPeriodSeconds * 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    const times = generateTimeWindow(time, secondsInPast, secondsInFuture);
    fetchSituationalPicture(times, true).then((situationalPicture) =>
      setBlueSituationalPicture(situationalPicture),
    );
    fetchGroundTruth(times, false).then((groundTruths) =>
      setRedGroundTruth(groundTruths),
    );
  }, [time, secondsInFuture]);

  return {
    time,
    blueSituationalPicture,
    redGroundTruth,
    blueCoverages,
    isPaused,
    setIsPaused: postIsPaused,
  };
}

async function fetchSituationalPicture(
  times: Date[],
  isBlue: boolean,
): Promise<SituationalPicture> {
  if (!isBlue) {
    throw new Error("No implemented yet");
  }

  const response = await fetch(`${BASE_URL}/situational_picture/BLUE`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(times.map((t) => t.toISOString())),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data: SituationalPicture = await response.json();

  return data;
}

async function fetchSimulationTime(): Promise<Date> {
  const response = await fetch(`${BASE_URL}/time`);
  if (!response.ok) {
    const error = await response.json();
    console.error("Validation error:", JSON.stringify(error, null, 2));
    throw new Error(`GET /time failed: ${response.status}`);
  }
  const data: string = await response.json();
  return new Date(data);
}

async function fetchIsPaused(): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/is_paused`);
  if (!response.ok) {
    const error = await response.json();
    console.error("Validation error:", JSON.stringify(error, null, 2));
    throw new Error(`GET /is_paused failed: ${response.status}`);
  }
  const data: string = await response.json();
  return Boolean(data);
}

async function postIsPaused(isPaused: boolean) {
  if (isPaused) {
    const response = await fetch(`${BASE_URL}/pause`, { method: "POST" });
    if (!response.ok) {
      const error = await response.json();
      console.error("Validation error:", JSON.stringify(error, null, 2));
      throw new Error(`POST /pause failed: ${response.status}`);
    }
  } else {
    const response = await fetch(`${BASE_URL}/resume`, { method: "POST" });
    if (!response.ok) {
      const error = await response.json();
      console.error("Validation error:", JSON.stringify(error, null, 2));
      throw new Error(`POST /resume failed: ${response.status}`);
    }
  }
}

async function fetchGroundTruth(
  times: Date[],
  isBlue: boolean,
): Promise<GroundTruth[]> {
  if (isBlue) {
    throw new Error("No implemented yet");
  }

  const response = await fetch(`${BASE_URL}/ground_truth/RED`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(times.map((t) => t.toISOString())),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data: GroundTruth[] = await response.json();

  return data;
}

const calculateMonostaticCoverage = memoize(
  async (
    radar: Radar,
    target_alt: number,
    rcs: number,
    probability_threshold: number = 0.8,
    azimuth_resolution_degree: number = 2.0,
  ): Promise<GeoJSONFeature> => {
    const query = new URLSearchParams({
      target_alt: String(target_alt),
      rcs: String(rcs),
      probability_threshold: String(probability_threshold),
      azimuth_resolution_degree: String(azimuth_resolution_degree),
    });
    const res = await fetch(
      `${BASE_URL}/calculate_monostatic_coverage?${query}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(radar),
      },
    );
    if (!res.ok) {
      const error = await res.json();
      console.error("Validation error:", JSON.stringify(error, null, 2));
      throw new Error(
        `POST /calculate_monostatic_coverage failed: ${res.status}`,
      );
    }
    return res.json();
  },
  {
    promise: true,
    // We need to use this normalizer because the key order is not guaranteed
    // to be stable for objects.
    normalizer: (args) => stringify(args),
  },
);
