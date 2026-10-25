// (C) 2026 GoodData Corporation

import { type IDateDataset } from "../../typings/datasets.js";

/**
 * `data.measuresDateDatasets` — the per-measure date-dataset availability statuses, keyed by the
 * measure's localIdentifier.
 *
 * Entries are PARTIAL by contract: a writer may store a single leaf (`{ isLoading }` alone), and
 * every reader goes through the defaults-filling `getStatus` — see
 * measure_date_datasets_helpers.ts#getStatusFromState.
 *
 * All writers are slice cases: the open-report selected-dataset init, and
 * `measureFilterAdded`/`measureFilterRemoved` for the date-filter add/remove.
 */
export interface IMeasureDateDatasetsStatus {
    isLoading: boolean;
    availableDateDatasets: IDateDataset[];
    unavailableDateDatasetsCount: number;
    selectedDateDatasetUri?: string;
}

export type IMeasureDateDatasetsStatusEntry = Partial<IMeasureDateDatasetsStatus>;

export type IMeasureDateDatasetsState = Record<string, IMeasureDateDatasetsStatusEntry>;

export const measureDateDatasetsInitialState: IMeasureDateDatasetsState = Object.freeze({});
