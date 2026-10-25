// (C) 2007-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IDateDatasetAttribute } from "../typings/dataset_attribute.js";

export interface IDateDatasetsMetaItem {
    identifier: string;
    uri: string;
    type: string;
    title: string;
    summary: string;
    ref: ObjRef;
    attributes: ReadonlyArray<IDateDatasetAttribute>;
}

// native ES Map keyed by measure localIdentifier
export type IMeasureDateDatasetsMetaItems = Map<string, IDateDatasetsMetaItem>;
