// (C) 2007-2026 GoodData Corporation

import { keyBy } from "lodash-es";

import { type ObjRef } from "@gooddata/sdk-model";

import { type IDateDatasetAttribute } from "../typings/dataset_attribute.js";
import { type IDateDataset } from "../typings/datasets.js";

import { type IDateDatasetsMetaItem, type IMeasureDateDatasetsMetaItems } from "./date_datasets_meta_item.js";
import { GRANULARITY_OPTIONS, type IGranularityOption } from "./granularity.js";

/** A date-dataset attribute decorated with its granularity-option presentation fields. */
export type IDecoratedDateDatasetAttribute = IDateDatasetAttribute &
    Pick<IGranularityOption, "label" | "chronologicalGranularity" | "valuesPreview">;

export interface IDecoratedDateDatasetItem {
    title?: string;
    summary?: string;
    identifier?: string;
    uri?: string;
    ref?: ObjRef;
    attributes?: IDecoratedDateDatasetAttribute[];
    type?: string;
    id?: string;
    isAvailable?: boolean;
    relevance?: number;
    attributeTitle?: string;
    isDisabled?: boolean;
}

export interface IDecoratedDateDatasetMeta extends IDateDatasetsMetaItem {
    attributeTitle: string;
}

export interface IDecoratedDateDatasets {
    items: IDecoratedDateDatasetItem[];
    unavailable: number;
}

// Declared here rather than in typings/datasets.ts: it composes the DECORATED model shape, so
// importing it back from there would close a cycle.
export interface ISelectedDateDatasets {
    globalDateDatasets: IDecoratedDateDatasets;
    measureDateDatasets: IMeasureDateDatasetsMetaItems;
    /** every date dataset's meta, for the metric date filters that name their own dataset */
    dateDatasetsMeta?: ReadonlyArray<IDateDatasetsMetaItem>;
}

export function decoratedDateDataset(item: IDateDataset): IDecoratedDateDatasetItem {
    const attributesList = Array.isArray(item.attributes) ? item.attributes : [];
    const attributesByType = keyBy(attributesList, "dateType");

    const attributes = GRANULARITY_OPTIONS.map((option) => {
        const attribute = attributesByType[option.dateType];
        return attribute
            ? {
                  ...attribute,
                  label: option.label,
                  chronologicalGranularity: option.chronologicalGranularity,
                  valuesPreview: option.valuesPreview,
              }
            : null;
    }).filter((attribute) => !!attribute);

    return {
        ...item,
        attributeTitle: item.title,
        isDisabled: !item.isAvailable,
        attributes,
    };
}

export function decoratedDateDatasetMeta(item: IDateDatasetsMetaItem): IDecoratedDateDatasetMeta {
    return {
        ...item,
        attributeTitle: item.title,
    };
}

export function decoratedDateDatasets(dateDatasets: {
    available?: IDateDataset[];
    used?: IDateDataset[];
    unavailable?: number;
}): IDecoratedDateDatasets {
    // available + used
    const items = [...(dateDatasets.available ?? []), ...(dateDatasets.used ?? [])].map(decoratedDateDataset);

    return {
        items,
        // the buckets-cluster `{used}` currency never carries a count — default it so the
        // declared `IDecoratedDateDatasets.unavailable: number` is actually true
        unavailable: dateDatasets.unavailable ?? 0,
    };
}
