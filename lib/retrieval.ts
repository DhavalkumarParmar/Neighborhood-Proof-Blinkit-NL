/**
 * Wires the pure retrieval layer (lib/proof-core.ts) up to the JSON data.
 *
 * Server-only. The ledger is a few megabytes and must never reach the browser;
 * client components get the finished facts object as props instead.
 *
 * JSON is imported statically rather than read with fs so that the data files
 * are certain to be traced into the serverless bundle on deploy.
 */

import catalogData from "../data/catalog.json";
import storesData from "../data/stores.json";
import ledgerData from "../data/ledger.json";
import profilesData from "../data/profiles.json";
import {
  buildProofIndex,
  type CatalogItem,
  type LedgerRecord,
  type Store,
} from "./proof-core";

export type Profile = {
  id: string;
  name: string;
  label: string;
  blurb: string;
  storeId: string;
  interests: string[];
};

export const catalog = catalogData as CatalogItem[];
export const stores = storesData as Store[];
export const profiles = profilesData as Profile[];

const index = buildProofIndex(catalog, stores, ledgerData as LedgerRecord[]);

export const getProof = index.getProof;
export const getCategoryReturnRate = index.getCategoryReturnRate;
export const getItem = index.getItem;
export const getStore = index.getStore;

export function getProfile(profileId: string): Profile | undefined {
  return profiles.find((p) => p.id === profileId);
}

export const CATEGORY_ORDER = ["beauty", "pet", "baby", "home", "electronics"];

export {
  MIN_HOUSEHOLDS,
  WINDOW_DAYS,
  type Facts,
  type ProofFacts,
  type NoDataFacts,
  type CatalogItem,
  type Store,
} from "./proof-core";
