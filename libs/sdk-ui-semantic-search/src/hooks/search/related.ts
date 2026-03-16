// (C) 2024-2026 GoodData Corporation

import {
    type GenAIObjectType,
    type ISemanticSearchResultItem,
    type IdentifierRef,
    type ObjectType,
    areObjRefsEqual,
    assertNever,
} from "@gooddata/sdk-model";

import { type HybridSearchItemBuilder, type SearchItem } from "./types.js";

export function doFilterRelatedItems<I extends SearchItem>(
    items: ReadonlyArray<I>,
    searchResults: ISemanticSearchResultItem[],
    itemBuilder: HybridSearchItemBuilder<I>,
): ReadonlyArray<I> {
    const rest = searchResults.filter((item) => {
        const objRef = createIdentifierRef(item);
        return !items.some((searchItem) => areObjRefsEqual(searchItem.ref, objRef));
    });

    return rest
        .map((item) => {
            const objRef = createIdentifierRef(item);
            return itemBuilder(item, {
                ref: objRef,
                type: convertGenAiTypeToObjectType(item.type),
            });
        })
        .filter(Boolean) as I[];
}

function createIdentifierRef(item: ISemanticSearchResultItem): IdentifierRef {
    return {
        type: convertGenAiTypeToObjectType(item.type),
        identifier: item.id,
    };
}

function convertGenAiTypeToObjectType(type: GenAIObjectType): ObjectType {
    switch (type) {
        case "attribute":
            return "attribute";
        case "fact":
            return "fact";
        case "dashboard":
            return "analyticalDashboard";
        case "dataset":
            return "dataSet";
        case "date":
            return "dataSet";
        case "label":
            return "displayForm";
        case "metric":
            return "measure";
        case "visualization":
            return "insight";
        default:
            assertNever(type);
            throw new Error(`Unknown type: ${type}`);
    }
}
