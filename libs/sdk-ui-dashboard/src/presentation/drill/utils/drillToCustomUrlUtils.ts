// (C) 2026 GoodData Corporation

import {
    type IAttributeDisplayFormMetadataObject,
    type IDrillToCustomUrl,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import { getAttributeIdentifiersPlaceholdersFromUrl } from "@gooddata/sdk-model/internal";
import { type IDrillEvent, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";

/**
 * Used to determine if drill to URL actions should be disabled
 * when they reference attributes not present in the current drill intersection
 * (e.g., in multilayer geo charts where each layer has different attributes).
 * @internal
 */
export function getDrillToCustomUrlMissingAttributes(
    drillDefinition: IDrillToCustomUrl,
    drillEvent: IDrillEvent,
    displayFormsMap: Record<string, IAttributeDisplayFormMetadataObject>,
): string[] {
    const customUrl = drillDefinition.target.url;
    const attributePlaceholders = getAttributeIdentifiersPlaceholdersFromUrl(customUrl);

    if (attributePlaceholders.length === 0) {
        return [];
    }

    const intersection = drillEvent.drillContext.intersection ?? [];
    const intersectionAttributeRefs = intersection
        .map((element) => element.header)
        .filter(isDrillIntersectionAttributeItem)
        .map((header) => header.attributeHeader.formOf.ref);

    // Find placeholders that cannot be resolved and return their titles
    const missingAttributeTitles: Array<string> = [];

    for (const placeholder of attributePlaceholders) {
        const displayForm = displayFormsMap[placeholder.identifier];

        // Configuration error handled elsewhere
        if (!displayForm) {
            continue;
        }

        // Check if the attribute (that this display form belongs to) is in the intersection
        const isInIntersection = intersectionAttributeRefs.some((intersectionRef) =>
            areObjRefsEqual(displayForm.attribute, intersectionRef),
        );

        if (!isInIntersection) {
            missingAttributeTitles.push(displayForm.title);
        }
    }

    return missingAttributeTitles;
}
