// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";
import { type IDateDataset } from "../typings/datasets.js";

export const measureDateDatasetsRequested = createAction(
    ActionTypeKeys.MEASURE_DATE_DATASETS_REQUESTED,
    (localIdentifier: string) => ({ payload: { localIdentifier } }),
);

export const measureDateDatasetsStarted = createAction(
    ActionTypeKeys.MEASURE_DATE_DATASETS_STARTED,
    (localIdentifier: string) => ({ payload: { localIdentifier } }),
);

export const measureDateDatasetsFinished = createAction(
    ActionTypeKeys.MEASURE_DATE_DATASETS_FINISHED,
    (
        localIdentifier: string,
        availableDateDatasets: IDateDataset[],
        unavailableDateDatasetsCount: number,
    ) => ({ payload: { localIdentifier, availableDateDatasets, unavailableDateDatasetsCount } }),
);

export const measureDateDatasetsError = createAction(
    ActionTypeKeys.MEASURE_DATE_DATASETS_ERROR,
    (localIdentifier: string, error?: Error) => ({ payload: { localIdentifier, error } }),
);

export const selectDateDataset = createAction(
    ActionTypeKeys.MEASURE_DATE_DATASETS_SELECT,
    (localIdentifier: string, dateDatasetIdentifier: string) => ({
        payload: { localIdentifier, dateDatasetIdentifier },
    }),
);

export const selectDateDatasetWithoutTimeTravel = createAction(
    ActionTypeKeys.MEASURE_DATE_DATASETS_SELECT_WITHOUT_TIME_TRAVEL,
    (localIdentifier: string, dateDatasetIdentifier: string) => ({
        payload: { localIdentifier, dateDatasetIdentifier },
    }),
);

export const MeasureDateDatasetsActions = {
    measureDateDatasetsRequested,
    measureDateDatasetsStarted,
    measureDateDatasetsFinished,
    measureDateDatasetsError,
    selectDateDatasetWithoutTimeTravel,
    selectDateDataset,
};
