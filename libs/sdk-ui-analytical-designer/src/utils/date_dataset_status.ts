// (C) 2007-2026 GoodData Corporation

import { type IMeasureDateDatasetsStatusEntry } from "../store/measure_date_datasets/measure_date_datasets_state.js";

export const DateDatasetStatusUtils = {
    hasSelectedDateDataset,
};

/**
 * Checks if the provided date dataset status have date dataset selected or not
 * @param dateDatasetStatus -
 */
function hasSelectedDateDataset(dateDatasetStatus: IMeasureDateDatasetsStatusEntry): boolean {
    return !!dateDatasetStatus.selectedDateDatasetUri;
}
