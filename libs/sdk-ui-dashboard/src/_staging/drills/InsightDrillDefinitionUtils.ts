// (C) 2021 GoodData Corporation

import { InsightDrillDefinition, isDrillFromAttribute, isDrillFromMeasure } from "@gooddata/sdk-backend-spi";
import { isLocalIdRef, ObjRefInScope } from "@gooddata/sdk-model";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { IDrillDownDefinition } from "../../types";
import { RemoveDrillsSelector } from "../../model/commands/insight";

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
