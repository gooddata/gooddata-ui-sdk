// (C) 2020-2021 GoodData Corporation

import { IDrillEvent, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import { IDrillDownDefinition } from "@gooddata/sdk-ui-ext";

export function getDrillDownAttributeTitle(drill: IDrillDownDefinition, drillEvent: IDrillEvent) {
    return (drillEvent.drillContext.intersection || [])
        .map((intersectionElement) => intersectionElement.header)
        .filter(isDrillIntersectionAttributeItem)
        .filter(
            (intersectionAttributeItem) =>
                intersectionAttributeItem.attributeHeader.localIdentifier === drill.origin.localIdentifier,
        )
        .map((intersectionAttributeItem) => intersectionAttributeItem.attributeHeaderItem.name)[0];
}
