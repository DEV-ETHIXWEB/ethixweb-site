import type { Location } from "@/data/locations/types";
import seattle from "@/data/locations/seattle-wa";
import seatac from "@/data/locations/seatac-wa";
import tukwila from "@/data/locations/tukwila-wa";
import kent from "@/data/locations/kent-wa";
import renton from "@/data/locations/renton-wa";
import bellevue from "@/data/locations/bellevue-wa";
import tacoma from "@/data/locations/tacoma-wa";
import federalWay from "@/data/locations/federal-way-wa";
import auburn from "@/data/locations/auburn-wa";

export type { Location } from "@/data/locations/types";

// Every service-area page, in the order the hub lists them. Adding a city is
// one new data file here plus its import; the route, the hub, the footer and
// the sitemap (scripts/generate-sitemap.mjs reads this folder) pick it up.
export const LOCATIONS: Location[] = [
  seattle,
  seatac,
  tukwila,
  kent,
  renton,
  bellevue,
  tacoma,
  federalWay,
  auburn,
];

export function getLocation(slug: string): Location | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
