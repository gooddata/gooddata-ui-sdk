// (C) 2026 GoodData Corporation

import {
    setSelectedByIdentifierInState,
    setSelectedInState,
    setStatusInState,
} from "../store/measure_date_datasets/measure_date_datasets_helpers.js";
import { type IAppState } from "../store/types.js";
import { type IDateDataset } from "../typings/datasets.js";

/**
 * Test-only seeding of a measure's loaded date-dataset availability — the same write the
 * MEASURE_DATE_DATASETS_FINISHED case performs, applied without driving the root
 * reducer, so fixtures can seed arbitrary intermediate states PLAIN.
 */
export function seedMeasureDateDatasetStatus(
    state: IAppState,
    measureLocalIdentifier: string,
    availableDateDatasets: IDateDataset[],
    unavailableDateDatasetsCount: number,
): IAppState {
    return {
        ...state,
        data: {
            ...state.data,
            measuresDateDatasets: setStatusInState(
                state.data.measuresDateDatasets,
                measureLocalIdentifier,
                availableDateDatasets,
                unavailableDateDatasetsCount,
            ),
        },
    };
}

/**
 * Test-only selection by dataset URI — the same write the open-report flow performs. Unlike the
 * by-identifier form it does NOT check the measure's availability, which is what lets a fixture seed
 * a selection the measure cannot actually offer.
 */
export function seedMeasureDateDatasetSelectedUri(
    state: IAppState,
    measureLocalIdentifier: string,
    dateDatasetUri: string | undefined,
): IAppState {
    return {
        ...state,
        data: {
            ...state.data,
            measuresDateDatasets: setSelectedInState(
                state.data.measuresDateDatasets,
                measureLocalIdentifier,
                dateDatasetUri,
            ),
        },
    };
}

/** Test-only selection by dataset identifier — the MEASURE_DATE_DATASETS_SELECT case's write. */
export function seedMeasureDateDatasetSelection(
    state: IAppState,
    measureLocalIdentifier: string,
    dateDatasetIdentifier: string,
): IAppState {
    return {
        ...state,
        data: {
            ...state.data,
            measuresDateDatasets: setSelectedByIdentifierInState(
                state.data.measuresDateDatasets,
                measureLocalIdentifier,
                dateDatasetIdentifier,
            ),
        },
    };
}
