// (C) 2025-2026 GoodData Corporation

import { type Completion } from "@codemirror/autocomplete";
import { type EditorView } from "@codemirror/view";
import { type IntlShape } from "react-intl";

import {
    type CatalogItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogDateAttribute,
    type IDataSetMetadataObject,
    type IMetadataObjectBase,
    type ObjRef,
    type ObjectType,
    isAttributeDisplayFormMetadataObject,
    isCatalogAttribute,
    isCatalogDateAttribute,
    isCatalogDateDataset,
    isCatalogFact,
    isCatalogMeasure,
    isDataSetMetadataObject,
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
    "dataset",
] as const;

// Utility: Get regex for references
export function getReferenceRegex() {
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
    item: CatalogItem | ICatalogDateAttribute | IAttributeDisplayFormMetadataObject | IDataSetMetadataObject,
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
    if (isDataSetMetadataObject(item)) {
        return item.id;
    }
    return null;
}

// Utility: Get catalog item ID
export function getCatalogItemTitle(
    item: CatalogItem | ICatalogDateAttribute | IAttributeDisplayFormMetadataObject | IDataSetMetadataObject,
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
    if (isDataSetMetadataObject(item)) {
        return item.title ?? item.id;
    }
    return "Unknown Item";
}

// Utility: Get catalog item description
export function getCatalogItemDescription(
    item: CatalogItem | ICatalogDateAttribute | IAttributeDisplayFormMetadataObject | IDataSetMetadataObject,
) {
    if (isCatalogFact(item)) {
        return item.fact.description;
    }
    if (isCatalogAttribute(item)) {
        return item.attribute.description;
    }
    if (isCatalogMeasure(item)) {
        return item.measure.description;
    }
    if (isCatalogDateDataset(item)) {
        return item.dataSet.description;
    }
    if (isCatalogDateAttribute(item)) {
        return item.attribute.description;
    }
    if (isAttributeDisplayFormMetadataObject(item)) {
        return item.description;
    }
    if (isDataSetMetadataObject(item)) {
        return item.description;
    }
    return undefined;
}

// Utility: Get a catalog item type
export function getCatalogItemType(
    item: CatalogItem | ICatalogDateAttribute | IAttributeDisplayFormMetadataObject | IDataSetMetadataObject,
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
    if (isDataSetMetadataObject(item)) {
        return "dataset";
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

// Utility: Get object type by ref type
export function getObjectTypeByRefType(type: TextContentObject["type"]): ObjectType {
    switch (type) {
        case "metric":
            return "measure";
        case "dataset":
            return "dataSet";
        case "label":
            return "displayForm";
        case "date":
            return "dataSet";
        case "dashboard":
            return "analyticalDashboard";
        case "visualization":
            return "insight";
        default:
            return type;
    }
}

export type IMetadataObjectBaseWithId = IMetadataObjectBase & { id: string };

// Utility: Find catalog item or reference
export function findCatalogItemOrReference(
    references: TextContentObject[],
    catalogItems: CatalogItem[],
    id: string,
    type: string,
): IMetadataObjectBaseWithId | undefined {
    const ref = references
        .filter((r) => r.id === id && r.type === type)
        .reduce<IMetadataObjectBaseWithId | undefined>((_, curr) => {
            return {
                type: getObjectTypeByRefType(curr.type),
                id: curr.id,
                title: curr.title,
                description: "",
                deprecated: false,
                production: true,
                unlisted: false,
            };
        }, undefined);

    const catalogItem = catalogItems
        .filter((c) => {
            return (
                c.type === getObjectTypeByRefType(type as TextContentObject["type"]) &&
                getCatalogItemId(c) === id
            );
        })
        .reduce<IMetadataObjectBaseWithId | undefined>((_, curr) => {
            const type = getCatalogItemType(curr);
            if (!type) {
                return undefined;
            }
            return {
                type: getObjectTypeByRefType(type),
                id: getCatalogItemId(curr) ?? "",
                title: getCatalogItemTitle(curr) ?? "",
                description: getCatalogItemDescription(curr) ?? "",
                deprecated: false,
                production: true,
                unlisted: false,
            };
        }, undefined);

    return catalogItem ?? ref;
}
