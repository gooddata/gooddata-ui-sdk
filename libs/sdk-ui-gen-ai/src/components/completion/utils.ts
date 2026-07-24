// (C) 2025-2026 GoodData Corporation

import { type Completion } from "@codemirror/autocomplete";
import { type EditorView } from "@codemirror/view";
import { type IntlShape } from "react-intl";

import {
    type CatalogItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogDateAttribute,
    type ObjRef,
    isAttributeDisplayFormMetadataObject,
    isCatalogAttribute,
    isCatalogDateAttribute,
    isCatalogDateDataset,
    isCatalogFact,
    isCatalogMeasure,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { type TextContentObject } from "../../model.js";

import { getInfo } from "./InfoComponent.js";

export interface ICompletionItem extends Completion {
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
        includeTags,
        excludeTags,
    }: {
        items: CatalogItem[];
        search?: string;
        canManage?: boolean;
        canAnalyze?: boolean;
        onCompletionSelected?: (completion: ICompletionItem) => void;
        includeTags?: string[];
        excludeTags?: string[];
    },
): ICompletionItem[] {
    const options = items
        .filter((item) => !isCatalogItemHidden(item))
        .filter((item) => matchTags(item, includeTags, excludeTags))
        .map((item): ICompletionItem[] => {
            return getItems(intl, item, { canManage, canAnalyze, onCompletionSelected });
        })
        .flat();

    return options.filter((opt) => {
        const label = opt.label.toLowerCase();
        const apply = String(opt.apply ?? "").toLowerCase();
        return search ? label.includes(search.toLowerCase()) || apply.includes(search.toLowerCase()) : true;
    });
}

const SupportedReferenceTypes = [
    "fact",
    "metric",
    "date",
    "attribute",
    "label",
    "dashboard",
    "visualization",
] as const;

// Utility: Get regex for references
export function getReferenceRegex(split?: boolean) {
    if (split) {
        return new RegExp(`(\\{(?:${SupportedReferenceTypes.join("|")})\\/[.A-Za-z0-9_-]{1,255}\\})`, "g");
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
        onCompletionSelected?: (completion: ICompletionItem) => void;
    },
): ICompletionItem[] {
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
                    onCompletionSelected?.(completion as ICompletionItem);
                    applyItem(view, insert, from, to);
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
                    onCompletionSelected?.(completion as ICompletionItem);
                    applyItem(view, insert, from, to);
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
                    onCompletionSelected?.(completion as ICompletionItem);
                    applyItem(view, insert, from, to);
                },
            },
        ];
    }
    if (isCatalogDateDataset(item)) {
        const dateItems = item.dateAttributes.map((attr): ICompletionItem => {
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
                    onCompletionSelected?.(completion as ICompletionItem);
                    applyItem(view, insert, from, to);
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
                    onCompletionSelected?.(completion as ICompletionItem);
                    applyItem(view, insert, from, to);
                },
            },
            ...dateItems,
        ];
    }
    return [];
}

function applyItem(view: EditorView, insert: string, from: number, to: number) {
    view.dispatch({
        changes: { from: from - 1, to, insert },
        selection: { anchor: from - 1 + insert.length },
    });
}

// Utility: Get item for completion
export function objRefToTextContentObject(
    objRef: ObjRef,
    title?: string,
    forceType?: TextContentObject["type"],
): TextContentObject | null {
    if (isIdentifierRef(objRef)) {
        const type = objRef.type;
        return {
            id: objRef.identifier,
            title: title ?? objRef.identifier,
            type:
                forceType ??
                ((type === "measure"
                    ? "metric"
                    : type === "displayForm"
                      ? "label"
                      : type) as TextContentObject["type"]),
        };
    }
    return null;
}

// Utility: Get completion item ID
export function getCompletionItemId(data: ICompletionItem) {
    return getCatalogItemId(data.item);
}

// Utility: Get catalog item ID
export function getCatalogItemId(
    item: CatalogItem | ICatalogDateAttribute | IAttributeDisplayFormMetadataObject,
): string | null {
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
    if (isAttributeDisplayFormMetadataObject(item)) {
        return item.id;
    }
    return null;
}

// Utility: Get catalog item ID
export function getCatalogItemTitle(
    item: CatalogItem | ICatalogDateAttribute | IAttributeDisplayFormMetadataObject,
) {
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
    if (isAttributeDisplayFormMetadataObject(item)) {
        return item.title ?? item.id;
    }
    return "Unknown Item";
}

// Utility: Get a catalog item type
export function getCatalogItemType(
    item: CatalogItem | ICatalogDateAttribute | IAttributeDisplayFormMetadataObject,
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
    if (isAttributeDisplayFormMetadataObject(item)) {
        return "label";
    }
    return null;
}

/**
 * Determines whether a catalog item should be hidden from suggestions
 */
function isCatalogItemHidden(item: CatalogItem): boolean {
    if (isCatalogAttribute(item)) {
        return item.attribute.isHidden === true;
    }
    if (isCatalogMeasure(item)) {
        return item.measure.isHidden === true;
    }
    if (isCatalogFact(item)) {
        return item.fact.isHidden === true;
    }
    if (isCatalogDateDataset(item)) {
        return item.dataSet.isHidden === true;
    }
    return false;
}

// Utility: Match tags
export function matchTags(item: CatalogItem, includeTags?: string[], excludeTags?: string[]) {
    function getTags() {
        if (isCatalogAttribute(item)) {
            return item.attribute.tags ?? [];
        }
        if (isCatalogMeasure(item)) {
            return item.measure.tags ?? [];
        }
        if (isCatalogFact(item)) {
            return item.fact.tags ?? [];
        }
        if (isCatalogDateDataset(item)) {
            return item.dataSet.tags ?? [];
        }
        return [];
    }

    if (includeTags?.length || excludeTags?.length) {
        const tags = getTags();

        const hasIncludeTags = includeTags?.length ? includeTags.some((tag) => tags.includes(tag)) : true;
        const hasExcludeTags = excludeTags?.length ? excludeTags.some((tag) => tags.includes(tag)) : false;

        return hasIncludeTags && !hasExcludeTags;
    }
    return true;
}
