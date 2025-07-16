// (C) 2024-2025 GoodData Corporation

import {
    ISemanticSearchRelationship,
    ISemanticSearchResultItem,
    isSemanticSearchResultItem,
    isSemanticSearchRelationship,
} from "@gooddata/sdk-model";
import { ListItem } from "../types.js";

export const getAreaLabel = ({
    item,
}:
    | ListItem<ISemanticSearchResultItem, ISemanticSearchRelationship>
    | ListItem<ISemanticSearchRelationship, undefined>): string => {
    const typeLabel = getTypeLabel(item);
    return `${getTypeTitle(item)}, ${typeLabel}`;
};

function getTypeLabel(item: ISemanticSearchResultItem | ISemanticSearchRelationship): string {
    if (isSemanticSearchResultItem(item)) {
        if (item.type === "visualization") {
            // Ideally we want to translate this properly, but there is no ready-made mapping in SDK.
            // Consider doing it once l18n for this package is moved here.
            // For area-labels, visualizationUrl minus the "local:" prefix is a good enough fallback.
            return item.visualizationUrl?.replace("local:", "") ?? item.type;
        }
        return item.type;
    }
    if (isSemanticSearchRelationship(item)) {
        return item.sourceObjectType;
    }
    return "";
}

function getTypeTitle(item: ISemanticSearchResultItem | ISemanticSearchRelationship): string {
    if (isSemanticSearchResultItem(item)) {
        return item.title;
    }
    if (isSemanticSearchRelationship(item)) {
        return item.sourceObjectTitle;
    }
    return "";
}
