import { useEffect, useState } from "react";
import type { components } from "./schema";
import type { Feature, Polygon, MultiPolygon } from "geojson";
export type GeoJSONPolygon = Polygon;
export type GeoJSONFeature = Feature<Polygon | MultiPolygon>;
import { useSettings } from "./useSettings";
import type { Perspective } from "../contexts/SettingsContext";
import { SIDC } from "../contexts/constants";
// import createFetchClient from "openapi-fetch";
// import createClient from "openapi-react-query";

export type SituationalPicture =
  components["schemas"]["ExtrapolatedSituationalPicture"];
export type MonostaticSensor = components["schemas"]["MonostaticSensor-Input"];
export type PclSensor = components["schemas"]["PclSensor-Input"];
export type Receiver = components["schemas"]["Receiver-Input"];
export type Transmitter = components["schemas"]["Transmitter-Input"];
export type Point = components["schemas"]["Point"];
export type Track = components["schemas"]["ExtrapolatedTrack"];
export type GroundTruth = components["schemas"]["ExtrapolatedGroundtruth"];
export type Team = components["schemas"]["Team"];
export type Sensor = MonostaticSensor | PclSensor;

export type DisplayData = {
  blueRadars: (MonostaticSensor | PclSensor)[];
  blueTargets: Track[] | GroundTruth[];
  blueGeoJson: Record<string, GeoJSONFeature>;
  redRadars: Sensor[];
  redTargets: Track[] | GroundTruth[];
  redGeoJson: Record<string, GeoJSONFeature>;
};

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
  const { settings } = useSettings();
  const [time, setTime] = useState(new Date("2022-06-27T23:01:40"));
  const [isPaused, setIsPaused] = useState(true);
  const [speedupFactor, setSpeedupFactor] = useState(1);
  const [blueGroundTruth, setBlueGroundTruth] = useState([] as GroundTruth[]);
  const [redGroundTruth, setRedGroundTruth] = useState([] as GroundTruth[]);
  const [blueSituationalPicture, setBlueSituationalPicture] = useState(
    DEFAULT_SITUATIONAL_PICTURE,
  );
  const [redSituationalPicture, setRedSituationalPicture] = useState(
    DEFAULT_SITUATIONAL_PICTURE,
  );
  const [blueGeoJson, setBlueGeoJson] = useState(
    {} as Record<string, GeoJSONFeature>,
  );
  const [redGeoJson, setRedGeoJson] = useState(
    {} as Record<string, GeoJSONFeature>,
  );

  const secondsInPast = 1;
  const secondsInFuture = extrapolate ? 60 : 0;

  const refreshPeriodSeconds = 1;

  // const time = new Date("2022-06-27T23:01:40");

  useEffect(() => {
    fetchGeoJson("BLUE").then(setBlueGeoJson);
    fetchGeoJson("RED").then(setRedGeoJson);
  }, []);

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
    fetchSituationalPicture(times, false).then((situationalPicture) =>
      setRedSituationalPicture(situationalPicture),
    );
    fetchGroundTruth(times, false).then((groundTruths) =>
      setRedGroundTruth(groundTruths),
    );
    fetchGroundTruth(times, true).then((groundTruths) =>
      setBlueGroundTruth(groundTruths),
    );
    fetchSpeedupFactor().then((factor) => setSpeedupFactor(factor));
  }, [time, secondsInFuture]);

  // Summarize the data to be displayed.
  const displayData = buildDisplayData(
    settings.perspective,
    blueSituationalPicture,
    blueGroundTruth,
    blueGeoJson,
    redSituationalPicture,
    redGroundTruth,
    redGeoJson,
  );

  return {
    time,
    displayData,
    isPaused,
    setIsPaused: postIsPaused,
    speedupFactor,
    setSpeedupFactor: postSpeedup,
  };
}

function buildDisplayData(
  perspective: Perspective,
  blueSituationalPicture: SituationalPicture,
  blueGroundTruth: GroundTruth[],
  blueGeoJson: Record<string, GeoJSONFeature>,
  redSituationalPicture: SituationalPicture,
  redGroundTruth: GroundTruth[],
  redGeoJson: Record<string, GeoJSONFeature>,
): DisplayData {
  let blueTrajectories = [];
  if (perspective === "RED") {
    blueTrajectories = redSituationalPicture.enemy_tracks;
  } else if (["BLUE", "GOD"].includes(perspective)) {
    blueTrajectories = blueGroundTruth.filter(
      (gt) => ![SIDC.BLUE_RADAR, SIDC.GREEN_TRANSMITTER].includes(gt.sidc),
    );
  } else {
    throw new Error("This part should never be reached!");
  }
  const blueRadars = ["BLUE", "GOD"].includes(perspective)
    ? blueSituationalPicture.friendly_radars
    : [];

  const displayBlueGeoJson = ["BLUE", "GOD"].includes(perspective)
    ? blueGeoJson
    : {};

  let redTrajectories = [] as Track[] | GroundTruth[];
  if (perspective === "BLUE") {
    redTrajectories = blueSituationalPicture.enemy_tracks;
  } else if (["RED", "GOD"].includes(perspective)) {
    redTrajectories = redGroundTruth;
  } else {
    throw new Error("This part should never be reached!");
  }
  const redRadars = ["RED", "GOD"].includes(perspective)
    ? redSituationalPicture.friendly_radars
    : [];

  const displayRedGeoJson = ["RED", "GOD"].includes(perspective)
    ? redGeoJson
    : {};

  return {
    blueRadars: blueRadars,
    blueTargets: blueTrajectories,
    blueGeoJson: displayBlueGeoJson,
    redRadars: redRadars,
    redTargets: redTrajectories,
    redGeoJson: displayRedGeoJson,
  };
}

async function fetchSituationalPicture(
  times: Date[],
  isBlue: boolean,
): Promise<SituationalPicture> {
  const team = isBlue ? "BLUE" : "RED";

  const response = await fetch(`${BASE_URL}/situational_picture/${team}`, {
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

async function fetchSpeedupFactor(): Promise<number> {
  const response = await fetch(`${BASE_URL}/speedup`);
  if (!response.ok) {
    const error = await response.json();
    console.error("Validation error:", JSON.stringify(error, null, 2));
    throw new Error(`GET /speedup failed: ${response.status}`);
  }
  const data: string = await response.json();
  return parseFloat(data);
}

async function postSpeedup(speedupFactor: number) {
  const response = await fetch(
    `${BASE_URL}/speedup?speedup_factor=${speedupFactor}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
      },
      body: "",
    },
  );
  if (!response.ok) {
    const error = await response.json();
    console.error("Validation error:", JSON.stringify(error, null, 2));
    throw new Error(`POST /speedup failed: ${response.status}`);
  }
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
  const team = isBlue ? "BLUE" : "RED";

  const response = await fetch(`${BASE_URL}/ground_truth/${team}`, {
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

async function fetchGeoJson(
  which: Team,
): Promise<Record<string, GeoJSONFeature>> {
  const response = await fetch(`${BASE_URL}/geojson/${which}`);
  if (!response.ok) {
    const error = await response.json();
    console.error("Validation error:", JSON.stringify(error, null, 2));
    throw new Error(`GET /geojson/${which} failed: ${response.status}`);
  }
  return response.json();
}
