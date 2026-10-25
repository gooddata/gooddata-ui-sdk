// (C) 2026 GoodData Corporation

import { isEqual } from "lodash-es";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { type IDateDataset } from "../../typings/datasets.js";
import { DateDatasetUtils } from "../../utils/date_datasets.js";

import {
    type IMeasureDateDatasetsState,
    type IMeasureDateDatasetsStatus,
    measureDateDatasetsInitialState,
} from "./measure_date_datasets_state.js";

/**
 * Pure, identity-preserving operations over the `data.measuresDateDatasets` SUBTREE.
 *
 * ONE set of semantics for every write path: the slice's case reducers, the open-report case and the
 * metric-filter operations all go through these.
 *
 * Every helper returns the SAME reference when nothing changed — identity is re-established
 * explicitly, never inherited.
 */

// Returned BY REFERENCE to every measure without an entry (the common case), so it is frozen
// like measureDateDatasetsInitialState: one consumer mutating the status — or pushing into the
// shared empty array — would otherwise corrupt the default for every other measure. Nothing
// mutates a status today; the freeze is what keeps that true.
const DEFAULT_STATUS: IMeasureDateDatasetsStatus = {
    unavailableDateDatasetsCount: 0,
    availableDateDatasets: [],
    isLoading: false,
    selectedDateDatasetUri: undefined,
};
Object.freeze(DEFAULT_STATUS.availableDateDatasets);
Object.freeze(DEFAULT_STATUS);

/** Defaults-filling read — entries are PARTIAL by contract (see the state module). */
export function getStatusFromState(
    state: IMeasureDateDatasetsState | undefined,
    measureIdentifier: string,
): IMeasureDateDatasetsStatus {
    const entry = (state ?? measureDateDatasetsInitialState)[measureIdentifier];
    return entry ? { ...DEFAULT_STATUS, ...entry } : DEFAULT_STATUS;
}

/**
 * Stores the loaded availability as the measure's WHOLE status (isLoading: false), preserving a
 * previously selected date dataset URI. The selection key is OMITTED (not present-undefined) when
 * there is none, so the stored entry stays clean for the serializable dev check and the isEqual
 * guard.
 */
export function setStatusInState(
    state: IMeasureDateDatasetsState,
    measureIdentifier: string,
    availableDateDatasets: IDateDataset[],
    unavailableDateDatasetsCount: number,
): IMeasureDateDatasetsState {
    const preservedSelection = state[measureIdentifier]?.selectedDateDatasetUri;
    const nextEntry = {
        availableDateDatasets,
        unavailableDateDatasetsCount,
        isLoading: false,
        ...(preservedSelection === undefined ? {} : { selectedDateDatasetUri: preservedSelection }),
    };
    return isEqual(state[measureIdentifier], nextEntry)
        ? state
        : { ...state, [measureIdentifier]: nextEntry };
}

export function setLoadingInState(
    state: IMeasureDateDatasetsState,
    measureIdentifier: string,
    isLoading: boolean,
): IMeasureDateDatasetsState {
    const entry = state[measureIdentifier];
    if (entry?.isLoading === isLoading) {
        return state;
    }
    return { ...state, [measureIdentifier]: { ...entry, isLoading } };
}

/**
 * Sets (or, with undefined, clears) the selected date dataset URI. Clearing REMOVES the key, which
 * every read normalizes away through the defaults-filling getStatusFromState.
 */
export function setSelectedInState(
    state: IMeasureDateDatasetsState,
    measureIdentifier: string,
    dateDatasetUri: string | undefined,
): IMeasureDateDatasetsState {
    const entry = state[measureIdentifier];
    if (dateDatasetUri === undefined) {
        if (entry === undefined || !("selectedDateDatasetUri" in entry)) {
            return state;
        }
        const { selectedDateDatasetUri: _cleared, ...rest } = entry;
        return { ...state, [measureIdentifier]: rest };
    }
    if (entry?.selectedDateDatasetUri === dateDatasetUri) {
        return state;
    }
    return { ...state, [measureIdentifier]: { ...entry, selectedDateDatasetUri: dateDatasetUri } };
}

/**
 * The date dataset a measure gets when the user has not picked one: the insight's PRIMARY date
 * dataset when the insight uses dates at all and that dataset is available for this measure,
 * otherwise the most relevant of the available ones.
 *
 * All three inputs belong to the BUCKETS domain, so the caller resolves them and this helper stays
 * one domain wide.
 */
export function getDefaultSelectedDateDatasetUri(
    availableDateDatasets: IDateDataset[],
    {
        hasDateInBuckets,
        hasDateFilter,
        primaryDateDatasetRef,
    }: { hasDateInBuckets: boolean; hasDateFilter: boolean; primaryDateDatasetRef: ObjRef | undefined },
): string {
    if ((hasDateInBuckets || hasDateFilter) && primaryDateDatasetRef) {
        const primaryDateDataset = availableDateDatasets.find((dateDataset) =>
            areObjRefsEqual(dateDataset.ref, primaryDateDatasetRef),
        );
        if (primaryDateDataset) {
            return primaryDateDataset.uri;
        }
    }

    return DateDatasetUtils.getMostRelevantDateDatasetUri(availableDateDatasets);
}

/** Resolves the dataset by identifier within the measure's OWN availability; unknown → no-op. */
export function setSelectedByIdentifierInState(
    state: IMeasureDateDatasetsState,
    measureIdentifier: string,
    dateDatasetIdentifier: string,
): IMeasureDateDatasetsState {
    const availableDateDatasets = getStatusFromState(state, measureIdentifier).availableDateDatasets;
    const selectedDateDataset = availableDateDatasets.find(
        (dateDataset) => dateDataset.identifier === dateDatasetIdentifier,
    );
    return selectedDateDataset
        ? setSelectedInState(state, measureIdentifier, selectedDateDataset.uri)
        : state;
}
