// (C) 2024 GoodData Corporation

import { isIdentifierRef } from "@gooddata/sdk-model";

import { ValuesLimitingItem } from "../../../../types.js";
import { AttributeFilterInteractionType } from "../../../../../../../model/index.js";

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
