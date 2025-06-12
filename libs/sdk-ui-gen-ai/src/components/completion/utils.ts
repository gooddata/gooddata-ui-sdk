// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";
import { Completion } from "@codemirror/autocomplete";
import {
    CatalogItem,
    isCatalogAttribute,
    isCatalogDateDataset,
    isCatalogFact,
    isCatalogMeasure,
} from "@gooddata/sdk-model";

import { getInfo } from "./InfoComponent.js";

// Utility: Escape regex special characters
export function escapeRegex(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
        onCompletionSelected?: (completion: Completion) => void;
    },
) {
    const options = items
        .map((item): Completion | Completion[] | null => {
            if (isCatalogAttribute(item)) {
                return getItem(
                    item.attribute.title,
                    "attribute",
                    getInfo(intl, item.attribute.id, item.attribute, {
                        dataset: item.dataSet,
                        canManage,
                        canAnalyze,
                    }),
                    onCompletionSelected,
                );
            }
            if (isCatalogFact(item)) {
                return getItem(
                    item.fact.title,
                    "fact",
                    getInfo(intl, item.fact.id, item.fact, {
                        canManage,
                        canAnalyze,
                    }),
                    onCompletionSelected,
                );
            }
            if (isCatalogMeasure(item)) {
                return getItem(
                    item.measure.title,
                    "metric",
                    getInfo(intl, item.measure.id, item.measure, {
                        canManage,
                        canAnalyze,
                    }),
                    onCompletionSelected,
                );
            }
            if (isCatalogDateDataset(item)) {
                return [
                    getItem(
                        item.dataSet.title,
                        "date",
                        getInfo(intl, item.dataSet.id, item.dataSet, {
                            dataset: item.dataSet,
                            canManage,
                            canAnalyze,
                        }),
                        onCompletionSelected,
                    ),
                    ...item.dateAttributes.map((attr) => {
                        return getItem(
                            attr.attribute.title,
                            "date",
                            getInfo(intl, attr.attribute.id, attr.attribute, {
                                dataset: item.dataSet,
                                canManage,
                                canAnalyze,
                            }),
                            onCompletionSelected,
                        );
                    }),
                ];
            }
            return null;
        })
        .flat()
        .filter((opt) => opt !== null) as Completion[];

    return options.filter((opt) => {
        const label = opt.label.toLowerCase();
        const apply = String(opt.apply ?? "").toLowerCase();
        return search ? label.includes(search.toLowerCase()) || apply.includes(search.toLowerCase()) : true;
    });
}

// Utility: Get item for completion
export function getItem(
    label: string,
    type: "fact" | "metric" | "attribute" | "date",
    info: () => Node,
    onCompletion: (completion: Completion) => void,
): Completion {
    return {
        type,
        label,
        info,
        apply: (view, completion, from, to) => {
            onCompletion(completion);
            view.dispatch({
                changes: { from, to, insert: completion.label },
                selection: { anchor: from + completion.label.length },
            });
        },
    };
}
