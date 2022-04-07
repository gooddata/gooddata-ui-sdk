// (C) 2021-2022 GoodData Corporation
import flatMap from "lodash/flatMap";
import {
    idRef,
    IInsight,
    ObjRef,
    ObjRefInScope,
    objRefToString,
    IDrillToAttributeUrl,
    IDrillToCustomUrl,
    IDrillToDashboard,
    IDrillToInsight,
    InsightDrillDefinition,
    isDrillFromAttribute,
    isDrillFromMeasure,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    IAttributeDisplayFormMetadataObject,
    IListedDashboard,
} from "@gooddata/sdk-model";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { typesUtils } from "@gooddata/util";
import {
    getAttributeIdentifiersPlaceholdersFromUrl,
    getDrillOriginLocalIdentifier,
    getLocalIdentifierOrDie,
} from "../../../../_staging/drills/drillingUtils";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap";

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

export function extractInsightRefs(items: ReadonlyArray<InsightDrillDefinition>): ObjRef[] {
    return items.filter(isDrillToInsight).map((item) => item.target);
}

export function extractDisplayFormIdentifiers(drillDefinitions: InsightDrillDefinition[]): ObjRef[] {
    return flatMap(
        drillDefinitions
            .filter(typesUtils.combineGuards(isDrillToCustomUrl, isDrillToAttributeUrl))
            .map((drillItem) => {
                if (isDrillToCustomUrl(drillItem)) {
                    const params = getAttributeIdentifiersPlaceholdersFromUrl(drillItem.target.url);
                    const ids = params.map((param) => {
                        return idRef(param.identifier);
                    });
                    return ids;
                } else {
                    return [drillItem.target.displayForm, drillItem.target.hyperlinkDisplayForm];
                }
            }),
    );
}

export interface InsightDrillDefinitionValidationData {
    dashboardsMap: ObjRefMap<IListedDashboard>;
    insightsMap: ObjRefMap<IInsight>;
    displayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>;
}

export const hyperlinkDisplayFormType = "GDC.link";

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
        return validateDrillToCustomURLDefinition(drillDefinition, validationContext);
    }

    if (isDrillToAttributeUrl(drillDefinition)) {
        return validateDrillToAttributeUrlDefinition(drillDefinition, validationContext);
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

export function validateDrillToCustomURLDefinition(
    drillDefinition: IDrillToCustomUrl,
    validationContext: InsightDrillDefinitionValidationData,
): IDrillToCustomUrl {
    const ids = extractDisplayFormIdentifiers([drillDefinition]);

    ids.forEach((identifer) => {
        const displayForms = validationContext.displayFormsMap.get(identifer);
        if (!displayForms) {
            throw new Error(
                `Cannot find AttributeDisplayForm definition specified by identifier: ${objRefToString(
                    identifer,
                )}`,
            );
        }
    });

    return drillDefinition;
}

export function validateDrillToAttributeUrlDefinition(
    drillDefinition: IDrillToAttributeUrl,
    validationContext: InsightDrillDefinitionValidationData,
): IDrillToAttributeUrl {
    const displayForms = validationContext.displayFormsMap.get(drillDefinition.target.displayForm);

    if (!displayForms) {
        throw new Error(
            `Cannot find target displayForm: ${objRefToString(drillDefinition.target.displayForm)}`,
        );
    }

    const hyperlinkDisplayForm = validationContext.displayFormsMap.get(
        drillDefinition.target.hyperlinkDisplayForm,
    );

    if (!hyperlinkDisplayForm) {
        throw new Error(
            `Cannot find target hyperlinkDisplayForm: ${objRefToString(
                drillDefinition.target.hyperlinkDisplayForm,
            )}`,
        );
    }

    if (hyperlinkDisplayForm.displayFormType !== hyperlinkDisplayFormType) {
        throw new Error(`DisplayFormType of target hyperlinkDisplayForm type has to be GDC.link`);
    }

    return drillDefinition;
}
