// (C) 2007-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IGranularityOption } from "../models/granularity.js";

import { type IDateDatasetAttribute } from "./dataset_attribute.js";

export interface IDateDatasets {
    available: IDateDataset[];
    unavailable: number;
    allItems?: IDateDataset[];
}

export interface IDateDataset {
    ref: ObjRef;
    attributes: ReadonlyArray<IDateDatasetAttribute>;
    id: string;
    identifier: string;
    isAvailable: boolean;
    relevance: number;
    title: string;
    summary: string;
    type: string;
    uri: string;
}

/**
 * The "used date datasets" currency `buckets_service` derives from the date bucket items and the date
 * filter.
 */
export interface IUsedDateDatasets {
    used: IDateDataset[];
    available?: IDateDataset[];
}

// ISelectedDateDatasets lives in models/date_dataset.ts: it composes the DECORATED
// model shape, and keeping it here made typings/datasets depend on the model it types —
// a cycle once the model started importing IDateDataset from this file.

export interface IGranularityOptionWithRefs extends IGranularityOption {
    ref: ObjRef;
    dfRef: ObjRef;
    cacheIdentifier: string;
}

export interface IDateDatasetRefWithGranularities {
    ref: ObjRef;
    attributes: IGranularityOptionWithRefs[];
}
