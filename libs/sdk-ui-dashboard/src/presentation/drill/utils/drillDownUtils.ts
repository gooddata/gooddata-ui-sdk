// (C) 2020-2021 GoodData Corporation

import { isDrillToLegacyDashboard } from "@gooddata/sdk-backend-spi";
import { IDrillEvent, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import compact from "lodash/compact";
import { IDrillDownDefinition, DashboardDrillDefinition, isDrillDownDefinition } from "../../../types";
import { getDrillOriginLocalIdentifier } from "../../../_staging/drills/InsightDrillDefinitionUtils";

/**
 * @internal
 */
export function getDrillDownAttributeTitle(drill: IDrillDownDefinition, drillEvent: IDrillEvent): string {
    return (drillEvent.drillContext.intersection || [])
        .map((intersectionElement) => intersectionElement.header)
        .filter(isDrillIntersectionAttributeItem)
        .filter(
            (intersectionAttributeItem) =>
                intersectionAttributeItem.attributeHeader.localIdentifier === drill.origin.localIdentifier,
        )
        .map((intersectionAttributeItem) => intersectionAttributeItem.attributeHeaderItem.name)[0];
}

/**
 * Implicit drillDown has lower priority, so needs to be removed when other drill config exists for the same attribute
 *
 * @internal
 */
export function filterDrillFromAttributeByPriority(
    drillDefinitions: DashboardDrillDefinition[],
): DashboardDrillDefinition[] {
    const drillOriginsWithoutDrillDown = compact(
        drillDefinitions.map((d) => {
            if (!isDrillToLegacyDashboard(d) && !isDrillDownDefinition(d)) {
                return getDrillOriginLocalIdentifier(d);
            }
        }),
    );

    return drillDefinitions.filter((dd) => {
        if (isDrillDownDefinition(dd)) {
            return !drillOriginsWithoutDrillDown.includes(getDrillOriginLocalIdentifier(dd));
        }

        return true;
    });
}
