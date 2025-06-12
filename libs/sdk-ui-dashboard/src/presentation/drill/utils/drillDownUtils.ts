// (C) 2020-2024 GoodData Corporation

import {
    IAttributeDisplayFormMetadataObject,
    IDrillDownIntersectionIgnoredAttributes,
    isCrossFiltering,
    isDrillToLegacyDashboard,
} from "@gooddata/sdk-model";
import { IDrillEvent, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import isEqual from "lodash/isEqual.js";
import compact from "lodash/compact.js";
import uniqWith from "lodash/uniqWith.js";
import {
    getDrillOriginLocalIdentifier,
    isDrillConfigured,
    isDrillDownIntersectionIgnoredAttributesForHierarchy,
} from "../../../_staging/drills/drillingUtils.js";
import { DashboardDrillDefinition, IDrillDownDefinition } from "../../../types.js";

import { isDrillToUrl } from "../types.js";

/**
 * @internal
 */
export function getDrillDownTitle(
    drillDefinition: IDrillDownDefinition,
    drillEvent: IDrillEvent,
    drillDownIntersectionIgnoredAttributes?: IDrillDownIntersectionIgnoredAttributes[],
    drillTargetDisplayForm?: IAttributeDisplayFormMetadataObject,
): string | null {
    const localIdentifier = getDrillOriginLocalIdentifier(drillDefinition);

    if (drillDownIntersectionIgnoredAttributes) {
        const drillDownIntersectionIgnoredAttributesForCurrentHierarchy =
            drillDownIntersectionIgnoredAttributes?.find((ignored) => {
                return isDrillDownIntersectionIgnoredAttributesForHierarchy(
                    ignored,
                    drillDefinition.hierarchyRef!,
                );
            });
        const ignoredAttributesLocalIdentifiers =
            drillDownIntersectionIgnoredAttributesForCurrentHierarchy?.ignoredAttributes ?? [];

        if (ignoredAttributesLocalIdentifiers.includes(localIdentifier)) {
            return drillDefinition.title ?? drillTargetDisplayForm?.title ?? "";
        }
    }

    return getDrillOriginAttributeElementTitle(localIdentifier, drillEvent);
}

/**
 * @internal
 */
export function getDrillOriginAttributeElementTitle(
    drillOriginLocalId: string,
    drillEvent: IDrillEvent,
): string | null {
    return (drillEvent.drillContext.intersection || [])
        .map((intersectionElement) => intersectionElement.header)
        .filter(isDrillIntersectionAttributeItem)
        .filter(
            (intersectionAttributeItem) =>
                intersectionAttributeItem.attributeHeader.localIdentifier === drillOriginLocalId,
        )
        .map((intersectionAttributeItem) => intersectionAttributeItem.attributeHeaderItem.name)[0];
}

/**
 * Get total number of IDrillToUrl
 * @internal
 */
export function getTotalDrillToUrlCount(drillDefinition: DashboardDrillDefinition[]): number {
    return drillDefinition.filter(isDrillToUrl).length;
}

/**
 * Implicit drill (currently IDrillDownDefinition and implicit IDrillToAttributeUrl) has lower priority,
 * so needs to be removed when other drill config exists for the same attribute
 *
 * @internal
 */
export function filterDrillFromAttributeByPriority(
    drillDefinitions: DashboardDrillDefinition[],
    configuredDrills: DashboardDrillDefinition[] = [],
): DashboardDrillDefinition[] {
    // need create deep equal unique drills array because we can get same two drills that are configured and implicit e.g. IDrillToAttributeUrl
    // and is not able to configure more drills on one origin
    // configured once has higher priority
    const uniqueDrillDefinitions = uniqWith(drillDefinitions, isEqual);

    const drillOriginsWithoutImplicitDrills = compact(
        uniqueDrillDefinitions.map((drill) => {
            if (!isDrillToLegacyDashboard(drill) && isDrillConfigured(drill, configuredDrills)) {
                return getDrillOriginLocalIdentifier(drill);
            }
            return undefined;
        }),
    );

    return uniqueDrillDefinitions.filter((drill) => {
        if (isDrillToLegacyDashboard(drill) || isCrossFiltering(drill)) {
            return true;
        }

        if (!isDrillConfigured(drill, configuredDrills)) {
            return !drillOriginsWithoutImplicitDrills.includes(getDrillOriginLocalIdentifier(drill));
        }

        return true;
    });
}
