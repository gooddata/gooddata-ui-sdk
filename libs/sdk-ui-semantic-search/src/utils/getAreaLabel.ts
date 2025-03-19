// (C) 2024 GoodData Corporation

import { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { ListItem } from "../types.js";

export const getAreaLabel = ({ item }: ListItem<ISemanticSearchResultItem>): string => {
    if (item.type === "visualization") {
        // Ideally we want to translate this properly, but there is no ready-made mapping in SDK.
        // Consider doing it once l18n for this package is moved here.
        // For area-labels, visualizationUrl minus the "local:" prefix is a good enough fallback.
        return item.visualizationUrl?.replace("local:", "") ?? item.type;
    }

    return item.type;
};
