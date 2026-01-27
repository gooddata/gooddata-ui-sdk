// (C) 2021-2026 GoodData Corporation

import {
    type IAttribute,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardTab,
    type IDrillToAttributeUrl,
    type IDrillToCustomUrl,
    type IDrillToDashboard,
    type IDrillToInsight,
    type IInsight,
    type IListedDashboard,
    type InsightDrillDefinition,
    type LocalIdRef,
    type ObjRef,
    areObjRefsEqual,
    idRef,
    isDrillFromAttribute,
    isDrillFromMeasure,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    isListedDashboard,
    objRefToString,
} from "@gooddata/sdk-model";
import {
    getAttributeIdentifiersPlaceholdersFromUrl,
    getDashboardAttributeFilterPlaceholdersFromUrl,
    getInsightAttributeFilterPlaceholdersFromUrl,
} from "@gooddata/sdk-model/internal";
import { type IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { combineGuards } from "@gooddata/util";

import { getDrillOriginLocalIdentifier } from "../../../../_staging/drills/drillingUtils.js";
import { type ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";
import { type IInaccessibleDashboard } from "../../../types/inaccessibleDashboardTypes.js";
import { isDisplayFormRelevantToDrill } from "../../common/isDisplayFormRelevantToDrill.js";

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
    return drillDefinitionArray.some((it) => {
        return it.localIdentifier === drillDefinition.localIdentifier;
    });
}

export function getDrillDefinitionFromArray(
    drillDefinition: InsightDrillDefinition,
    drillDefinitionArray: InsightDrillDefinition[] = [],
): InsightDrillDefinition | undefined {
    return drillDefinitionArray.find((it) => {
        return it.localIdentifier === drillDefinition.localIdentifier;
    });
}

export function validateDrillDefinitionByLocalIdentifier(
    ref: LocalIdRef,
    drillDefinitionArray: InsightDrillDefinition[] = [],
): InsightDrillDefinition {
    const result = drillDefinitionArray.find((item) => {
        return item.localIdentifier === ref.localIdentifier;
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
    return drillDefinitions
        .filter(combineGuards(isDrillToCustomUrl, isDrillToAttributeUrl))
        .flatMap((drillItem) => {
            if (isDrillToCustomUrl(drillItem)) {
                const params = getAttributeIdentifiersPlaceholdersFromUrl(drillItem.target.url);
                // normalize ref take the value from state ...
                // md object has to be identifier
                return params.map((param) => idRef(param.identifier, "displayForm"));
            } else {
                return [drillItem.target.displayForm, drillItem.target.hyperlinkDisplayForm];
            }
        });
}

export function extractDashboardFilterDisplayFormIdentifiers(
    drillDefinitions: InsightDrillDefinition[],
): ObjRef[] {
    return drillDefinitions.filter(isDrillToCustomUrl).flatMap((drillItem) => {
        const dashboardAttributeFilterPlaceholdersFromUrl = getDashboardAttributeFilterPlaceholdersFromUrl(
            drillItem.target.url,
        );
        // normalize ref take the value from state ...
        // md object has to be identifier
        return dashboardAttributeFilterPlaceholdersFromUrl.map((param) =>
            idRef(param.identifier, "displayForm"),
        );
    });
}

export function extractInsightFilterDisplayFormIdentifiers(
    drillDefinitions: InsightDrillDefinition[],
): ObjRef[] {
    return drillDefinitions.filter(isDrillToCustomUrl).flatMap((drillItem) => {
        const insightAttributeFilterPlaceholders = getInsightAttributeFilterPlaceholdersFromUrl(
            drillItem.target.url,
        );
        // normalize ref take the value from state ...
        // md object has to be identifier
        return insightAttributeFilterPlaceholders.map((param) => idRef(param.identifier, "displayForm"));
    });
}

export interface IInsightDrillDefinitionValidationData {
    widgetInsightAttributes: IAttribute[];
    dashboardsMap: ObjRefMap<IListedDashboard>;
    insightsMap: ObjRefMap<IInsight>;
    displayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>;
    availableDrillTargets: IAvailableDrillTargets;
    inaccessibleDashboardsMap: ObjRefMap<IInaccessibleDashboard>;
    currentDashboardRef: ObjRef | undefined;
    currentDashboardTabs: IDashboardTab[] | undefined;
}

export function validateInsightDrillDefinition(
    drillDefinition: InsightDrillDefinition,
    validationContext: IInsightDrillDefinitionValidationData,
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
    validationContext: IInsightDrillDefinitionValidationData,
): IDrillToDashboard {
    const { target, drillIntersectionIgnoredAttributes, targetTabLocalIdentifier } = drillDefinition;
    if (target) {
        let result: IDrillToDashboard | undefined = undefined;
        const targetDashboard =
            validationContext.dashboardsMap.get(target) ||
            validationContext.inaccessibleDashboardsMap.get(target);

        if (targetDashboard) {
            // Check if drilling to the same dashboard
            const isDrillingToSelf =
                validationContext.currentDashboardRef &&
                areObjRefsEqual(validationContext.currentDashboardRef, target);

            // Validate targetTab exists if specified
            if (targetTabLocalIdentifier) {
                // Use current dashboard tabs if drilling to self, otherwise use accessible dashboards tabs
                const tabsToCheck = isDrillingToSelf
                    ? validationContext.currentDashboardTabs
                    : isListedDashboard(targetDashboard)
                      ? targetDashboard.tabs
                      : undefined;

                const tabExists = tabsToCheck?.some(
                    (tab: IDashboardTab) => tab.localIdentifier === targetTabLocalIdentifier,
                );
                if (!tabExists) {
                    throw new Error(
                        `Target tab "${targetTabLocalIdentifier}" not found in dashboard "${targetDashboard.title}"`,
                    );
                }
            }

            // normalize ref take the value from state ...
            // md object has to be identifier
            result = {
                ...drillDefinition,
                target: idRef(targetDashboard.identifier, "analyticalDashboard"),
            };
        }

        if (drillIntersectionIgnoredAttributes && drillIntersectionIgnoredAttributes.length > 0) {
            const areAllIgnoredAttributesAvailable = drillIntersectionIgnoredAttributes.every((localId) =>
                validationContext.widgetInsightAttributes.some(
                    (attr) => attr.attribute.localIdentifier === localId,
                ),
            );

            if (!areAllIgnoredAttributesAvailable) {
                throw new Error("Not all drill intersection ignored attributes are available in the insight");
            }
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
    validationContext: IInsightDrillDefinitionValidationData,
): IDrillToInsight {
    const { target, drillIntersectionIgnoredAttributes } = drillDefinition;
    let result: IDrillToInsight | undefined = undefined;

    if (target) {
        const targetInsights = validationContext.insightsMap.get(target);

        if (targetInsights) {
            // normalize ref take the value from state ...
            result = {
                ...drillDefinition,
                target: targetInsights.insight.ref,
            };
        }

        if (drillIntersectionIgnoredAttributes && drillIntersectionIgnoredAttributes.length > 0) {
            const areAllIgnoredAttributesAvailable = drillIntersectionIgnoredAttributes.every((localId) =>
                validationContext.widgetInsightAttributes.some(
                    (attr) => attr.attribute.localIdentifier === localId,
                ),
            );

            if (!areAllIgnoredAttributesAvailable) {
                throw new Error("Not all drill intersection ignored attributes are available in the insight");
            }
        }
    }

    if (result) {
        return result;
    }

    throw Error("Unknown target Insight");
}

export function validateDrillToCustomURLDefinition(
    drillDefinition: IDrillToCustomUrl,
    validationContext: IInsightDrillDefinitionValidationData,
): IDrillToCustomUrl {
    const ids = extractDisplayFormIdentifiers([drillDefinition]);

    ids.forEach((identifier) => {
        const displayForms = validationContext.displayFormsMap.get(identifier);
        if (!displayForms) {
            throw new Error(
                `Cannot find AttributeDisplayForm definition specified by identifier: ${objRefToString(
                    identifier,
                )}`,
            );
        }
    });

    return drillDefinition;
}

export function validateDrillToAttributeUrlDefinition(
    drillDefinition: IDrillToAttributeUrl,
    validationContext: IInsightDrillDefinitionValidationData,
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

    if (hyperlinkDisplayForm.displayFormType !== "GDC.link") {
        throw new Error(`DisplayFormType of target hyperlinkDisplayForm type has to be GDC.link`);
    }

    if (
        !isDisplayFormRelevantToDrill(
            drillDefinition,
            validationContext.availableDrillTargets,
            hyperlinkDisplayForm,
        )
    ) {
        throw new Error(
            `The hyperlinkDisplayForm ${objRefToString(
                hyperlinkDisplayForm.ref,
            )} in not a valid drill target`,
        );
    }

    return drillDefinition;
}
