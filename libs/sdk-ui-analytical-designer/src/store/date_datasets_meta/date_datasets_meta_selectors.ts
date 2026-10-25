// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

// The mount path comes straight from constants/state_paths, never from the domain's own
// reducer module (4.4 delivery note — that direction closes an import cycle).
import { type IDateDatasetsMeta } from "../../models/date_datasets_meta.js";
import { type IDateDatasetsMetaItem } from "../../models/date_datasets_meta_item.js";
import { type IAppState } from "../types.js";

import { dateDatasetsMetaInitialState } from "./date_datasets_meta_state.js";

/** The domain's single input selector. */
export const getDateDatasetsMetaState = (state: IAppState) => state.data.dateDatasetsMeta;

// The fallback fires on the value's KIND, not on nullishness: a `??` would pass a mis-shaped value
// through AS the items array, and the readers would then throw on `.find` / `.flatMap`.
export function getDateDatasetsMeta(state: IAppState): IDateDatasetsMeta {
    const plain = getDateDatasetsMetaState(state) as IDateDatasetsMeta;
    return Array.isArray(plain?.items) ? plain : dateDatasetsMetaInitialState;
}

export const getDateDatasetsMetaItems = createSelector(
    (state: IAppState) => state.data.dateDatasetsMeta.items,
    (items): IDateDatasetsMetaItem[] => {
        return Array.isArray(items) ? items : [];
    },
);

export function getDateDatasetUriByIdentifier(state: IAppState, identifier: string): string {
    const items = getDateDatasetsMeta(state).items;
    const dateDataset = items.find((dateDatasetMeta) => dateDatasetMeta.identifier === identifier);
    return dateDataset ? dateDataset.uri : undefined;
}

export const getDateAttributes = createSelector(getDateDatasetsMetaItems, (dateDatasets) =>
    dateDatasets.flatMap((dateDataset: IDateDatasetsMetaItem) => dateDataset.attributes),
);
