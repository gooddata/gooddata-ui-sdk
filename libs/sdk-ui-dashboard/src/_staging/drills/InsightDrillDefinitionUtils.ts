// (C) 2021 GoodData Corporation

import {
    IDrillToDashboard,
    IDrillToInsight,
    IListedDashboard,
    InsightDrillDefinition,
    isDrillFromAttribute,
    isDrillFromMeasure,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
} from "@gooddata/sdk-backend-spi";
import { idRef, IInsight, isLocalIdRef, ObjRef, ObjRefInScope } from "@gooddata/sdk-model";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { IDrillDownDefinition } from "../../types";
import { RemoveDrillsSelector } from "../../model/commands/insight";
import { ObjRefMap } from "../metadata/objRefMap";

export function getDrillOriginLocalIdentifier(
    drillDefinition: InsightDrillDefinition | IDrillDownDefinition,
): string {
    const { origin } = drillDefinition;

    if (isLocalIdRef(origin)) {
        return origin.localIdentifier;
    }

    if (isDrillFromMeasure(origin)) {
        return getLocalIdentifierOrDie(origin.measure);
    }

    if (isDrillFromAttribute(origin)) {
        return getLocalIdentifierOrDie(origin.attribute);
    }

    throw new Error("InsightDrillDefinition has invalid drill origin");
}

function getLocalIdentifierOrDie(ref: ObjRefInScope): string {
    if (isLocalIdRef(ref)) {
        return ref.localIdentifier;
    }

    throw new Error("Invalid ObjRef invariant expecting LocalIdRef");
}

export function validateDrillDefinitionOrigin(
    drillDefinition: InsightDrillDefinition,
    drillTargets: IAvailableDrillTargets,
): InsightDrillDefinition {
    const { origin } = drillDefinition;

    if (isDrillFromMeasure(origin)) {
        const originMeasureIdentifier = getDrillOriginLocalIdentifier(drillDefinition);
        const measureItems = drillTargets.measures || [];

        const measureIsValidTarget = measureItems.some(
            (i) => i.measure.measureHeaderItem.localIdentifier === originMeasureIdentifier,
        );

        if (!measureIsValidTarget) {
            throw new Error("InsightDrillDefinition origin is not valid measure drillTarget");
        }
    }

    if (isDrillFromAttribute(origin)) {
        const originAttributeIdentifier = getDrillOriginLocalIdentifier(drillDefinition);
        const attributeItems = drillTargets.attributes || [];

        const attributeIsValidTarget = attributeItems.some(
            (i) => i.attribute.attributeHeader.localIdentifier === originAttributeIdentifier,
        );

        if (!attributeIsValidTarget) {
            throw new Error("InsightDrillDefinition origin is not valid attribute drillTarget");
        }
    }

    return drillDefinition;
}

export function existsDrillDefinitionInArray(
    drillDefinition: InsightDrillDefinition,
    drillDefinitionArray: InsightDrillDefinition[] = [],
): boolean {
    const drillId = getDrillOriginLocalIdentifier(drillDefinition);

    return drillDefinitionArray.some((x) => {
        return drillId === getDrillOriginLocalIdentifier(x);
    });
}

export function validateDrillDefinitionByLocalIdentifier(
    ref: ObjRefInScope,
    drillDefinitionArray: InsightDrillDefinition[] = [],
): InsightDrillDefinition {
    const localIdentifier: string = getLocalIdentifierOrDie(ref);
    const result = drillDefinitionArray.find((item) => {
        return localIdentifier === getDrillOriginLocalIdentifier(item);
    });

    if (!result) {
        throw new Error("Cannot find drill definition specified by local identifier");
    }

    return result;
}

export function isAllDrillSelector(obj: RemoveDrillsSelector): obj is "*" {
    return obj === "*";
}

export interface InsightDrillDefinitionValidationData {
    dashboardsMap: ObjRefMap<IListedDashboard>;
    insightsMap: ObjRefMap<IInsight>;
}

export function validateInsightDrillDefinition(
    drillDefinition: InsightDrillDefinition,
    validationContext: InsightDrillDefinitionValidationData,
): InsightDrillDefinition {
    if (isDrillToDashboard(drillDefinition)) {
        return validateDrillToDashboardDefinition(drillDefinition, validationContext);
    }

    if (isDrillToInsight(drillDefinition)) {
        return validateDrillToInsightDefinition(drillDefinition, validationContext);
    }

    if (isDrillToCustomUrl(drillDefinition)) {
        // TODO: RAIL-3603
        return drillDefinition;
    }

    if (isDrillToAttributeUrl(drillDefinition)) {
        // TODO: RAIL-3603
        return drillDefinition;
    }

    throw new Error("Can not validate unknown drillDefinition");
}

function validateDrillToDashboardDefinition(
    drillDefinition: IDrillToDashboard,
    validationContext: InsightDrillDefinitionValidationData,
): IDrillToDashboard {
    const { target } = drillDefinition;
    if (target) {
        let result: IDrillToDashboard | undefined = undefined;
        const targetDashboard = validationContext.dashboardsMap.get(target);

        if (targetDashboard) {
            // normalize ref take the value from state ...
            // md object has to be identifer
            result = {
                ...drillDefinition,
                target: idRef(targetDashboard.identifier),
            };
        }

        if (result) {
            return result;
        }
    } else {
        return drillDefinition;
    }

    throw Error("Unknown target dashboard");
}

function validateDrillToInsightDefinition(
    drillDefinition: IDrillToInsight,
    validationContext: InsightDrillDefinitionValidationData,
): IDrillToInsight {
    const { target } = drillDefinition;
    let result: IDrillToInsight | undefined = undefined;

    if (target) {
        const targetInsights = validationContext.insightsMap.get(target);

        if (targetInsights) {
            // normalize ref take the value from state ...
            result = {
                ...drillDefinition,
                target: {
                    ...targetInsights.insight.ref,
                },
            };
        }
    }

    if (result) {
        return result;
    }

    throw Error("Unknown target Insight");
}

export function extractInsightRefs(items: ReadonlyArray<InsightDrillDefinition>): ObjRef[] {
    return items.filter(isDrillToInsight).map((item) => item.target);
}
