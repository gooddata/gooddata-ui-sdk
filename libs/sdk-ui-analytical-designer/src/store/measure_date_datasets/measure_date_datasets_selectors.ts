// (C) 2026 GoodData Corporation

import { type IAppState } from "../types.js";

import { getStatusFromState } from "./measure_date_datasets_helpers.js";
import {
    type IMeasureDateDatasetsState,
    type IMeasureDateDatasetsStatus,
} from "./measure_date_datasets_state.js";

/** The whole per-measure status map — the subtree itself, so the reference is already stable. */
export const getMeasureDateDatasetsState = (state: IAppState): IMeasureDateDatasetsState =>
    state.data.measuresDateDatasets;

/** Defaults-filled status of one measure (entries are partial by contract). */
export function getMeasureDateDatasetStatus(
    state: IAppState,
    measureLocalIdentifier: string,
): IMeasureDateDatasetsStatus {
    return getStatusFromState(getMeasureDateDatasetsState(state), measureLocalIdentifier);
}
