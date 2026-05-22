import { useEffect, useState } from "react";
import type { components } from "./schema";
import type { Feature, Polygon } from "geojson";
export type GeoJSONPolygon = Polygon;
export type GeoJSONFeature = Feature<Polygon>;
import memoize from "memoizee";
import stringify from "fast-json-stable-stringify";
import { useSettings } from "./useSettings";
import { arePointsEqual } from "../util/utils";
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
export type LatLonHeightGrid = components["schemas"]["LatLonHeightGrid"];
export type Sensor = MonostaticSensor | PclSensor;

export type DisplayData = {
  blueRadars: (MonostaticSensor | PclSensor)[];
  blueTargets: Track[] | GroundTruth[];
  blueTrackInitCoverages: GeoJSONFeature[];
  blueTrackUpdateCoverages: GeoJSONFeature[];
  redRadars: Sensor[];
  redTargets: Track[] | GroundTruth[];
  redTrackInitCoverages: GeoJSONFeature[];
  redTrackUpdateCoverages: GeoJSONFeature[];
};

const DEFAULT_PCL_RCS = 1.0;

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
  const [blueTrackInitCoverages, setBlueTrackInitCoverages] = useState(
    [] as GeoJSONFeature[],
  );
  const [blueTrackUpdateCoverages, setBlueTrackUpdateCoverages] = useState(
    [] as GeoJSONFeature[],
  );
  const [redTrackInitCoverages, setRedTrackInitCoverages] = useState(
    [] as GeoJSONFeature[],
  );
  const [redTrackUpdateCoverages, setRedTrackUpdateCoverages] = useState(
    [] as GeoJSONFeature[],
  );

  const secondsInPast = 1;
  const secondsInFuture = extrapolate ? 60 : 0;

  const refreshPeriodSeconds = 1;

  // const time = new Date("2022-06-27T23:01:40");

  useEffect(() => {
    for (const [
      situationalPicture,
      setTrackInitCoverages,
      setTrackUpdateCoverages,
    ] of [
      [
        blueSituationalPicture,
        setBlueTrackInitCoverages,
        setBlueTrackUpdateCoverages,
      ],
      [
        redSituationalPicture,
        setRedTrackInitCoverages,
        setRedTrackUpdateCoverages,
      ],
    ] as [
      SituationalPicture,
      (features: GeoJSONFeature[]) => void,
      (features: GeoJSONFeature[]) => void,
    ][]) {
      const monostaticSensors = situationalPicture.friendly_radars.filter(
        (sensor) =>
          arePointsEqual(sensor.receiver.point, sensor.transmitter.point),
      ) as MonostaticSensor[];
      const pclSensors = blueSituationalPicture.friendly_radars.filter(
        (sensor) =>
          !arePointsEqual(sensor.receiver.point, sensor.transmitter.point),
      ) as PclSensor[];
      Promise.all([
        Promise.all(
          monostaticSensors.map((radar) =>
            calculateMonostaticCoverage(
              radar,
              settings.coverageAlt,
              settings.coverageAzimuthResDegree,
              settings.coverageRangeOnly,
            ),
          ),
        ),
        calculatePclCoverage(pclSensors, DEFAULT_PCL_RCS, settings.pclCalcGrid),
      ]).then(([monostaticCoverages, pclCoverages]) => {
        const trackInitFeatures = monostaticCoverages;
        if (pclCoverages.length != 2) {
          throw Error("Expected 2");
        }
        if (pclCoverages[0].geometry.coordinates.length > 0) {
          trackInitFeatures.push(pclCoverages[0]);
        }
        const trackUpdateFeatures =
          pclCoverages[1].geometry.coordinates.length > 0
            ? [pclCoverages[1]]
            : [];

        // Track init mask.
        setTrackInitCoverages(trackInitFeatures);
        setTrackUpdateCoverages(trackUpdateFeatures);
      });
    }
  }, [blueSituationalPicture, redSituationalPicture, settings]);

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
    blueTrackInitCoverages,
    blueTrackUpdateCoverages,
    redSituationalPicture,
    redGroundTruth,
    redTrackInitCoverages,
    redTrackUpdateCoverages,
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
  blueTrackInitCoverages: GeoJSONFeature[],
  blueTrackUpdateCoverages: GeoJSONFeature[],
  redSituationalPicture: SituationalPicture,
  redGroundTruth: GroundTruth[],
  redTrackInitCoverages: GeoJSONFeature[],
  redTrackUpdateCoverages: GeoJSONFeature[],
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

  const displayBlueTrackInitCoverages = ["BLUE", "GOD"].includes(perspective)
    ? blueTrackInitCoverages
    : [];
  const displayBlueTrackUpdateCoverages = ["BLUE", "GOD"].includes(perspective)
    ? blueTrackUpdateCoverages
    : [];

  let redTrajectories = [] as Track[] | GroundTruth[];
  if (perspective === "BLUE") {
    redTrajectories = blueSituationalPicture.enemy_tracks;
  } else if (["RED", "GOD"].includes(perspective)) {
    redTrajectories = redGroundTruth;
  } else {
    throw new Error("This part should never be reached!");
  }
  const redRadars = ["RED", "GOD"].includes(perspective)
    ? blueSituationalPicture.friendly_radars
    : [];

  const displayRedTrackInitCoverages = ["RED", "GOD"].includes(perspective)
    ? redTrackInitCoverages
    : [];
  const displayRedTrackUpdateCoverages = ["RED", "GOD"].includes(perspective)
    ? redTrackUpdateCoverages
    : [];

  return {
    blueRadars: blueRadars,
    blueTargets: blueTrajectories,
    blueTrackInitCoverages: displayBlueTrackInitCoverages,
    blueTrackUpdateCoverages: displayBlueTrackUpdateCoverages,
    redRadars: redRadars,
    redTargets: redTrajectories,
    redTrackInitCoverages: displayRedTrackInitCoverages,
    redTrackUpdateCoverages: displayRedTrackUpdateCoverages,
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

const calculateMonostaticCoverage = memoize(
  async (
    radar: MonostaticSensor,
    target_alt: number,
    rcs: number,
    range_only: boolean,
    probability_threshold: number = 0.8,
    azimuth_resolution_degree: number = 2.0,
  ): Promise<GeoJSONFeature> => {
    const query = new URLSearchParams({
      target_alt: String(target_alt),
      rcs: String(rcs),
      probability_threshold: String(probability_threshold),
      azimuth_resolution_degree: String(azimuth_resolution_degree),
      range_only: String(range_only),
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

const calculatePclCoverage = memoize(
  async (
    sensors: PclSensor[],
    rcs: number,
    grid: LatLonHeightGrid,
    snrThreshold: number = 15.0,
    dopplerThreshold: number = 2.0,
    delayThreshold: number = 1.0,
  ): Promise<[GeoJSONFeature, GeoJSONFeature]> => {
    const query = new URLSearchParams({
      rcs: String(rcs),
      snr_threshold: String(snrThreshold),
      doppler_threshold: String(dopplerThreshold),
      delay_threshold: String(delayThreshold),
    });
    const res = await fetch(`${BASE_URL}/calculate_pcl_coverage?${query}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sensors: sensors,
        grid: grid,
      }),
    });
    if (!res.ok) {
      const error = await res.json();
      console.error("Validation error:", JSON.stringify(error, null, 2));
      throw new Error(`POST /calculate_pcl_coverage failed: ${res.status}`);
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
