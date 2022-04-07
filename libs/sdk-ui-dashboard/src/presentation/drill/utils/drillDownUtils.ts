// (C) 2020-2022 GoodData Corporation

import { isDrillToLegacyDashboard } from "@gooddata/sdk-model";
import { IDrillEvent, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import isEqual from "lodash/isEqual";
import compact from "lodash/compact";
import uniqWith from "lodash/uniqWith";
import { getDrillOriginLocalIdentifier, isDrillConfigured } from "../../../_staging/drills/drillingUtils";
import { DashboardDrillDefinition } from "../../../types";

import { isDrillToUrl } from "../types";

/**
 * @internal
 */
export function getDrillDownAttributeTitle(localIdentifier: string, drillEvent: IDrillEvent): string {
    return (drillEvent.drillContext.intersection || [])
        .map((intersectionElement) => intersectionElement.header)
        .filter(isDrillIntersectionAttributeItem)
        .filter(
            (intersectionAttributeItem) =>
                intersectionAttributeItem.attributeHeader.localIdentifier === localIdentifier,
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
        }),
    );

    return uniqueDrillDefinitions.filter((drill) => {
        if (isDrillToLegacyDashboard(drill)) {
            return true;
        }

        if (!isDrillConfigured(drill, configuredDrills)) {
            return !drillOriginsWithoutImplicitDrills.includes(getDrillOriginLocalIdentifier(drill));
        }

        return true;
    });
}
