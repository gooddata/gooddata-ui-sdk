// (C) 2007-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IDateDataset } from "../typings/datasets.js";

import { type IDecoratedDateDatasetItem } from "./date_dataset.js";
import { type IDateDatasetsMetaItem } from "./date_datasets_meta_item.js";

export interface IDecoratedDateDataset {
    readonly identifier: string;
    readonly title: string;
    readonly relevance?: number;
    readonly ref: ObjRef;
    readonly isAvailable?: boolean;
}

function createFromDecorated(dateDataset: IDecoratedDateDatasetItem): IDecoratedDateDataset {
    return {
        isAvailable: dateDataset.isAvailable,
        identifier: dateDataset.identifier,
        title: dateDataset.attributeTitle,
        relevance: dateDataset.relevance,
        ref: dateDataset.ref,
    };
}

function createDecorated(dateDataset: IDateDataset): IDecoratedDateDataset {
    return {
        isAvailable: dateDataset.isAvailable,
        identifier: dateDataset.identifier,
        title: dateDataset.title,
        relevance: dateDataset.relevance,
        ref: dateDataset.ref,
    };
}

function createFromMetaItem(dateDataset: IDateDatasetsMetaItem, isAvailable = true): IDecoratedDateDataset {
    return {
        isAvailable,
        identifier: dateDataset.identifier,
        title: dateDataset.title,
        ref: dateDataset.ref,
    };
}

export const DecoratedDateDataset = {
    createFromDecorated,
    createDecorated,
    createFromMetaItem,
};
