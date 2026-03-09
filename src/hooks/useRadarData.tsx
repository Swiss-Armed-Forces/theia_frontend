import type { components } from "./schema";
// import createFetchClient from "openapi-fetch";
// import createClient from "openapi-react-query";

export type SituationalPicture =
  components["schemas"]["ExtrapolatedSituationalPicture"];
export type Radar = components["schemas"]["Radar"];
export type Point = components["schemas"]["Point"];

// const fetchClient = createFetchClient<paths>({
//   baseUrl: "http://localhost:8000",
// });
// export const backendApi = createClient(fetchClient);

export default function useRadarData() {
  // TODO: Implement properly.
  //   const {
  //     data: time,
  //     error: timeError,
  //   } = backendApi.useQuery(
  //     "get",
  //     "/time",
  //     { refetchInterval: Infinity, placeholderData: (prev: Date) => prev },
  //   );

  //   if (timeError) {
  //     throw new Error("Could not load simulation time");
  //   }

  //   backendApi.useQuery(
  //     "post",
  //     "/time",
  //     { refetchInterval: Infinity, placeholderData: (prev: Date) => prev },
  //   )

  const time = new Date("2022-06-27T23:00:50");
  const blueSituationalPicture: SituationalPicture = {
    time: "2022-06-27T23:02:09",
    friendly_radars: [
      {
        transmitter: {
          id: 0,
          point: {
            lat: 47.349491,
            lon: 8.492063,
            alt: 856.2037851199802,
          },
          power: 500000,
          erp: 1000,
          antenna_height: 10,
          antenna_diameter: 4,
          frequency: 3000,
          pulse_width: 1,
          polarization: 1,
          bandwidth: 5,
          max_coherent_integration_time: 0.5,
          antenna_efficiency_value: 0.6,
          vertical_attenuation: null,
          horizontal_attenuation: null,
        },
        receiver: {
          id: 0,
          point: {
            lat: 47.349491,
            lon: 8.492063,
            alt: 856.2037851199802,
          },
          antenna_height: 10,
          diameter: 4,
          cpi_pulses: 1,
          pfa: 0.000001,
          min_elevation: -20,
          max_elevation: 60,
          rotation_time: 10,
          bandwidth: 5,
          gain: 0,
          losses: 0,
          noise_temperature: 300,
          noise_figure: 1.9,
          antenna_efficiency_value: 0.6,
          vertical_attenuation: null,
          horizontal_attenuation: null,
        },
      },
    ],
    enemy_tracks: [
      {
        id: "6d1c1b1a-9391-45f2-8346-b09c3ae038f4",
        points: [
          {
            time: "2022-06-27T23:02:09",
            lat: 47.4440430242241,
            lon: 8.550054444425978,
            alt: 11893.43293585442,
            v_east: 0,
            v_north: 0,
            v_up: 0,
          },
        ],
      },
      {
        id: "73f78c51-8501-4745-9198-470fa912079d",
        points: [
          {
            time: "2022-06-27T23:02:09",
            lat: 47.70992815506309,
            lon: 9.266922984238457,
            alt: 34506.75261290744,
            v_east: 0,
            v_north: 0,
            v_up: 0,
          },
        ],
      },
      {
        id: "0bf1976e-fe64-4bb4-9eb1-56d3fabcd14e",
        points: [
          {
            time: "2022-06-27T23:02:09",
            lat: 46.76782727199414,
            lon: 8.23828211935361,
            alt: 9665.625810338184,
            v_east: 0,
            v_north: 0,
            v_up: 0,
          },
        ],
      },
      {
        id: "e9901deb-0363-40ff-88b4-34c4f95771f9",
        points: [
          {
            time: "2022-06-27T23:02:09",
            lat: 47.43992768932143,
            lon: 8.39883841093901,
            alt: 10669.256248911843,
            v_east: 0,
            v_north: 0,
            v_up: 0,
          },
        ],
      },
      {
        id: "a9d97e6d-a06c-4bd4-9511-e90a7587cd1e",
        points: [
          {
            time: "2022-06-27T23:02:09",
            lat: 47.413770383609794,
            lon: 8.87335705151608,
            alt: 9650.71794578433,
            v_east: 0,
            v_north: 0,
            v_up: 0,
          },
        ],
      },
      {
        id: "2fd694f9-d05c-4cf0-8d2f-3b4fce3d5426",
        points: [
          {
            time: "2022-06-27T23:02:09",
            lat: 47.87311120451046,
            lon: 8.260788569686534,
            alt: 6605.661793084815,
            v_east: 0,
            v_north: 0,
            v_up: 0,
          },
        ],
      },
      {
        id: "725cc2b9-7b46-445d-91d0-1bb8393439fe",
        points: [
          {
            time: "2022-06-27T23:02:09",
            lat: 47.259956521951075,
            lon: 8.622963286414057,
            alt: 12178.995289000683,
            v_east: 0,
            v_north: 0,
            v_up: 0,
          },
        ],
      },
    ],
  };

  return { time, blueSituationalPicture };
}
