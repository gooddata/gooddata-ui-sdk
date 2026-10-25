// (C) 2026 GoodData Corporation

import { createSlice, current } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import {
    measureDateDatasetsError,
    measureDateDatasetsFinished,
    measureDateDatasetsStarted,
    selectDateDataset,
    selectDateDatasetWithoutTimeTravel,
} from "../../actions/measure_date_datasets_actions.js";
import { openReportFinished } from "../../actions/open_actions.js";
import {
    measureDateFilterApplied,
    measureFilterAdded,
    measureFilterRemoved,
} from "../bucket_filters/bucket_filters_operation_events.js";

import {
    setLoadingInState,
    setSelectedByIdentifierInState,
    setStatusInState,
} from "./measure_date_datasets_helpers.js";
import {
    type IMeasureDateDatasetsState,
    measureDateDatasetsInitialState,
} from "./measure_date_datasets_state.js";

/**
 * The `data.measuresDateDatasets` slice.
 *
 * MEASURE_DATE_DATASETS_REQUESTED is deliberately NOT a case: it is saga currency
 * (date_datasets_sagas.ts#loadMeasureDateDatasets) and changes no state. The WITHOUT_TIME_TRAVEL
 * select variant exists only to skip the undo snapshot (store/_infra/time_travel.ts keys on the
 * action type) — the state change is identical.
 */
const measureDateDatasetsSlice = createSlice({
    name: "measureDateDatasets",
    initialState: measureDateDatasetsInitialState,
    reducers: {},
    extraReducers: (builder) => {
        // Every case COMPUTES the next subtree through the identity-preserving helpers (shared
        // with the external writers — see measure_date_datasets_helpers.ts) and returns the DRAFT
        // when the helper answered with the same reference, which is immer's no-change signal.
        const guarded = (
            state: IMeasureDateDatasetsState,
            compute: (base: IMeasureDateDatasetsState) => IMeasureDateDatasetsState,
        ): IMeasureDateDatasetsState => {
            const base = current(state);
            const next = compute(base);
            return next === base ? state : next;
        };

        // The two select variants produce the IDENTICAL state change — they stay separate cases
        // only because store/_infra/time_travel.ts keys the undo snapshot on the action type.
        const applySelection = (
            state: IMeasureDateDatasetsState,
            action: ReturnType<typeof selectDateDataset | typeof selectDateDatasetWithoutTimeTravel>,
        ): IMeasureDateDatasetsState => {
            const { localIdentifier, dateDatasetIdentifier } = action.payload;
            return guarded(state, (base) =>
                setSelectedByIdentifierInState(base, localIdentifier, dateDatasetIdentifier),
            );
        };

        builder
            .addCase(measureDateDatasetsStarted, (state, action): IMeasureDateDatasetsState => {
                const { localIdentifier } = action.payload;
                return guarded(state, (base) => setLoadingInState(base, localIdentifier, true));
            })
            .addCase(measureDateDatasetsFinished, (state, action): IMeasureDateDatasetsState => {
                const { localIdentifier, availableDateDatasets, unavailableDateDatasetsCount } =
                    action.payload;
                return guarded(state, (base) =>
                    setStatusInState(
                        base,
                        localIdentifier,
                        availableDateDatasets,
                        unavailableDateDatasetsCount,
                    ),
                );
            })
            .addCase(measureDateDatasetsError, (state, action): IMeasureDateDatasetsState => {
                const { localIdentifier } = action.payload;
                return guarded(state, (base) => setLoadingInState(base, localIdentifier, false));
            })
            .addCase(selectDateDataset, applySelection)
            .addCase(selectDateDatasetWithoutTimeTravel, applySelection)
            // the metric date-filter gestures decide the measure's selection — adding one
            // selects the picked date dataset, removing one clears the selection back to the
            // recomputed default. The operation ran the domain's own helpers; the payload's value
            // lands as-is (unchanged values arrive by reference, which immer reads as no change).
            .addCase(
                measureFilterAdded,
                (_state, action): IMeasureDateDatasetsState => action.payload.measuresDateDatasets,
            )
            .addCase(
                measureDateFilterApplied,
                (_state, action): IMeasureDateDatasetsState => action.payload.measuresDateDatasets,
            )
            .addCase(
                measureFilterRemoved,
                (_state, action): IMeasureDateDatasetsState => action.payload.measuresDateDatasets,
            )
            // opening a report lands the loaded measures' date-dataset selections — the
            // open-report operation ran the domain's own helper per measure date filter
            // (open_report_operation.ts); an untouched subtree arrives by reference
            .addCase(
                openReportFinished,
                (_state, action): IMeasureDateDatasetsState => action.payload.result.measuresDateDatasets,
            );
    },
});

export const measureDateDatasetsSliceReducer: Reducer<IMeasureDateDatasetsState> =
    measureDateDatasetsSlice.reducer;
