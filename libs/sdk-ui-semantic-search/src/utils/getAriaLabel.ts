// (C) 2024-2025 GoodData Corporation
import {
    isSemanticSearchRelationship,
    isSemanticSearchResultItem,
    type ISemanticSearchRelationship,
    type ISemanticSearchResultItem,
} from "@gooddata/sdk-model";

export function getAriaLabel(item: ISemanticSearchResultItem | ISemanticSearchRelationship): string {
    if (isSemanticSearchResultItem(item)) {
        return getItemAriaLabel(item);
    }
    if (isSemanticSearchRelationship(item)) {
        return getRelationshipAriaLabel(item);
    }
    return "";
}

export function getItemAriaLabel(item: ISemanticSearchResultItem): string {
    return `${item.title}, ${getTypeLabel(item)}`;
}

export function getRelationshipAriaLabel(item: ISemanticSearchRelationship): string {
    return `${item.sourceObjectTitle}, ${item.targetObjectType}`;
}

function getTypeLabel(item: ISemanticSearchResultItem): string {
    if (item.type === "visualization") {
        // Ideally we want to translate this properly, but there is no ready-made mapping in SDK.
        // Consider doing it once l18n for this package is moved here.
        // For area-labels, visualizationUrl minus the "local:" prefix is a good enough fallback.
        return item.visualizationUrl?.replace("local:", "") ?? item.type;
    }
    return item.type;
}
