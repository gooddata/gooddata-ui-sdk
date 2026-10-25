// (C) 2007-2026 GoodData Corporation

import { type IDateDatasets } from "../typings/datasets.js";

import { DecoratedDateDataset, type IDecoratedDateDataset } from "./decorated_date_dataset.js";

export interface IDecoratedDateDatasets {
    readonly items: ReadonlyArray<IDecoratedDateDataset>;
    readonly unavailable: number;
}

/** The `?? []` covers an `allItems` key the slice stored with an `undefined` payload value. */
function createFromDateDatasets(
    dateDatasets: IDateDatasets,
    enableUnavailableItemsVisibility = false,
): IDecoratedDateDatasets {
    const items = (enableUnavailableItemsVisibility ? dateDatasets.allItems : dateDatasets.available) ?? [];

    return {
        items: items.map(DecoratedDateDataset.createDecorated),
        unavailable: dateDatasets.unavailable,
    };
}

export const DecoratedDateDatasets = {
    createFromDateDatasets,
};
