// (C) 2026 GoodData Corporation

// The mount path comes straight from constants/state_paths, never from the domain's own
// reducer module (4.4 delivery note — that direction closes an import cycle).
import { type IDateDataset, type IDateDatasets } from "../../typings/datasets.js";
import { type IAppState } from "../types.js";

import { type IDateDatasetsState } from "./date_datasets_state.js";

/**
 * The domain's single input selector. The cross-domain readers stay in
 * services/date_datasets_service.ts and hang off these accessors.
 */
export const getDateDatasetsState: (state: IAppState) => IDateDatasetsState = (state: IAppState) =>
    state.data.dateDatasets;

export const getAvailableDateDatasets = (state: IAppState): IDateDataset[] =>
    getDateDatasetsState(state).available ?? [];

/**
 * Hands out the STORED state itself, not a copy. Immer freezes the state in dev, so an accidental
 * mutation through this accessor throws loudly rather than silently diverging.
 */
export const getPlainDateDatasets = (state: IAppState): IDateDatasets => getDateDatasetsState(state);

export const isDateDatasetsLoaded = (state: IAppState): boolean => getDateDatasetsState(state).loaded;

export const isDateDatasetsUpdating = (state: IAppState): boolean => getDateDatasetsState(state).updating;

export const isDateDatasetsDropdownLoaded = (state: IAppState): boolean =>
    getDateDatasetsState(state).dropdownLoaded;

/**
 * The first available date dataset — the implicit default the buckets cluster attaches to a new
 * date filter.
 */
export const getFirstAvailableDateDataset = (state: IAppState): IDateDataset | undefined =>
    getAvailableDateDatasets(state)[0];
