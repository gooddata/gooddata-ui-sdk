// (C) 2024-2026 GoodData Corporation

import { isIdentifierRef } from "@gooddata/sdk-model";

import { type AttributeFilterInteractionType } from "../../../../../../../model/events/userInteraction.js";
import { type ValuesLimitingItem } from "../../../../types.js";

export const getTelemetryEventForLimitingItem = (
    item: ValuesLimitingItem,
): AttributeFilterInteractionType => {
    if (!isIdentifierRef(item)) {
        return "attributeFilterLimitParentFilterClicked";
    }
    switch (item.type) {
        case "measure":
            return "attributeFilterLimitMetricClicked";
        case "fact":
            return "attributeFilterLimitFactMetricClicked";
        case "attribute":
            return "attributeFilterLimitAttributeMetricClicked";
        default:
            return "attributeFilterLimitParentFilterClicked";
    }
};
