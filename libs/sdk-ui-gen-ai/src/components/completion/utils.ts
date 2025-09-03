// (C) 2025 GoodData Corporation

import { Completion } from "@codemirror/autocomplete";
import { IntlShape } from "react-intl";

import {
    CatalogItem,
    ICatalogDateAttribute,
    isCatalogAttribute,
    isCatalogDateAttribute,
    isCatalogDateDataset,
    isCatalogFact,
    isCatalogMeasure,
} from "@gooddata/sdk-model";

import { getInfo } from "./InfoComponent.js";

export interface CompletionItem extends Completion {
    item: CatalogItem | ICatalogDateAttribute;
}

// Utility: Get item title
export function getItemTitle(item: CatalogItem) {
    if (isCatalogAttribute(item)) {
        return item.attribute.title;
    }
    if (isCatalogMeasure(item)) {
        return item.measure.title;
    }
    if (isCatalogFact(item)) {
        return item.fact.title;
    }
    return null;
}

// Utility: Get options for completion
export function getOptions(
    intl: IntlShape,
    {
        items,
        search,
        canManage,
        canAnalyze,
        onCompletionSelected = () => {},
    }: {
        items: CatalogItem[];
        search?: string;
        canManage?: boolean;
        canAnalyze?: boolean;
        onCompletionSelected?: (completion: CompletionItem) => void;
    },
): CompletionItem[] {
    const options = items
        .map((item): CompletionItem[] => {
            return getItems(intl, item, { canManage, canAnalyze, onCompletionSelected });
        })
        .flat();

    return options.filter((opt) => {
        const label = opt.label.toLowerCase();
        const apply = String(opt.apply ?? "").toLowerCase();
        return search ? label.includes(search.toLowerCase()) || apply.includes(search.toLowerCase()) : true;
    });
}

const SupportedReferenceTypes = ["fact", "metric", "date", "attribute"] as const;

// Utility: Get regex for references
export function getReferenceRegex(split?: boolean) {
    if (split) {
        return new RegExp(`(\\{(?:${SupportedReferenceTypes.join("|")})\\/[.A-Za-z0-9_-]{1,255}\})`, "g");
    }
    return new RegExp(`\\{((?:${SupportedReferenceTypes.join("|")})\\/(?!\\.)[.A-Za-z0-9_-]{1,255})\\}`, "g");
}

// Utility: Get item for completion
export function getItems(
    intl: IntlShape,
    item: CatalogItem,
    {
        canManage,
        canAnalyze,
        onCompletionSelected,
    }: {
        canManage?: boolean;
        canAnalyze?: boolean;
        onCompletionSelected?: (completion: CompletionItem) => void;
    },
): CompletionItem[] {
    if (isCatalogAttribute(item)) {
        return [
            {
                type: "attribute",
                label: item.attribute.title,
                info: getInfo(intl, item.attribute.id, item.attribute, {
                    dataset: item.dataSet,
                    canManage,
                    canAnalyze,
                }),
                item,
                apply: (view, completion, from, to) => {
                    const type = "attribute" as (typeof SupportedReferenceTypes)[number];
                    const insert = `{${type}/${item.attribute.id}}`;
                    onCompletionSelected?.(completion as CompletionItem);
                    view.dispatch({
                        changes: { from, to, insert },
                        selection: { anchor: from + insert.length },
                    });
                },
            },
        ];
    }
    if (isCatalogFact(item)) {
        return [
            {
                type: "fact",
                label: item.fact.title,
                info: getInfo(intl, item.fact.id, item.fact, {
                    group: item.groups[0],
                    canManage,
                    canAnalyze,
                }),
                item,
                apply: (view, completion, from, to) => {
                    const type = "fact" as (typeof SupportedReferenceTypes)[number];
                    const insert = `{${type}/${item.fact.id}}`;
                    onCompletionSelected?.(completion as CompletionItem);
                    view.dispatch({
                        changes: { from, to, insert },
                        selection: { anchor: from + insert.length },
                    });
                },
            },
        ];
    }
    if (isCatalogMeasure(item)) {
        return [
            {
                type: "metric",
                label: item.measure.title,
                info: getInfo(intl, item.measure.id, item.measure, {
                    canManage,
                    canAnalyze,
                }),
                item,
                apply: (view, completion, from, to) => {
                    const type = "metric" as (typeof SupportedReferenceTypes)[number];
                    const insert = `{${type}/${item.measure.id}}`;
                    onCompletionSelected?.(completion as CompletionItem);
                    view.dispatch({
                        changes: { from, to, insert },
                        selection: { anchor: from + insert.length },
                    });
                },
            },
        ];
    }
    if (isCatalogDateDataset(item)) {
        const dateItems = item.dateAttributes.map((attr): CompletionItem => {
            return {
                type: "date",
                label: attr.attribute.title,
                info: getInfo(intl, attr.attribute.id, attr.attribute, {
                    dataset: item.dataSet,
                    canManage,
                    canAnalyze,
                }),
                item: attr,
                apply: (view, completion, from, to) => {
                    const type = "attribute" as (typeof SupportedReferenceTypes)[number];
                    const insert = `{${type}/${attr.attribute.id}}`;
                    onCompletionSelected?.(completion as CompletionItem);
                    view.dispatch({
                        changes: { from, to, insert },
                        selection: { anchor: from + insert.length },
                    });
                },
            };
        });

        return [
            {
                type: "date",
                label: item.dataSet.title,
                info: getInfo(intl, item.dataSet.id, item.dataSet, {
                    dataset: item.dataSet,
                    canManage,
                    canAnalyze,
                }),
                item,
                apply: (view, completion, from, to) => {
                    const type = "date" as (typeof SupportedReferenceTypes)[number];
                    const insert = `{${type}/${item.dataSet.id}}`;
                    onCompletionSelected?.(completion as CompletionItem);
                    view.dispatch({
                        changes: { from, to, insert },
                        selection: { anchor: from + insert.length },
                    });
                },
            },
            ...dateItems,
        ];
    }
    return [];
}

// Utility: Get completion item ID
export function getCompletionItemId(data: CompletionItem) {
    return getCatalogItemId(data.item);
}

// Utility: Get catalog item ID
export function getCatalogItemId(item: CatalogItem | ICatalogDateAttribute): string | null {
    if (isCatalogFact(item)) {
        return item.fact.id;
    }
    if (isCatalogAttribute(item)) {
        return item.attribute.id;
    }
    if (isCatalogMeasure(item)) {
        return item.measure.id;
    }
    if (isCatalogDateDataset(item)) {
        return item.dataSet.id;
    }
    if (isCatalogDateAttribute(item)) {
        return item.attribute.id;
    }
    return null;
}

// Utility: Get catalog item ID
export function getCatalogItemTitle(item: CatalogItem | ICatalogDateAttribute) {
    if (isCatalogFact(item)) {
        return item.fact.title ?? item.fact.id;
    }
    if (isCatalogAttribute(item)) {
        return item.attribute.title ?? item.attribute.id;
    }
    if (isCatalogMeasure(item)) {
        return item.measure.title ?? item.measure.id;
    }
    if (isCatalogDateDataset(item)) {
        return item.dataSet.title ?? item.dataSet.id;
    }
    if (isCatalogDateAttribute(item)) {
        return item.attribute.title ?? item.attribute.id;
    }
    return "Unknown Item";
}

// Utility: Get a catalog item type
export function getCatalogItemType(
    item: CatalogItem | ICatalogDateAttribute,
): (typeof SupportedReferenceTypes)[number] | null {
    if (isCatalogFact(item)) {
        return "fact";
    }
    if (isCatalogAttribute(item)) {
        return "attribute";
    }
    if (isCatalogMeasure(item)) {
        return "metric";
    }
    if (isCatalogDateDataset(item)) {
        return "date";
    }
    if (isCatalogDateAttribute(item)) {
        return "attribute";
    }
    return null;
}
