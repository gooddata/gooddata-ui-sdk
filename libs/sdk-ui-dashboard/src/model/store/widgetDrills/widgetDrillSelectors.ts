// (C) 2020-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import compact from "lodash/compact.js";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    isLocalIdRef,
    isIdentifierRef,
    isUriRef,
    ObjRef,
    areObjRefsEqual,
    ObjRefInScope,
    localIdRef,
    DrillDefinition,
    IDrillToAttributeUrl,
    isDrillFromAttribute,
    isDrillFromMeasure,
    ICatalogAttribute,
    ICatalogDateAttribute,
} from "@gooddata/sdk-model";
import {
    ExplicitDrill,
    HeaderPredicates,
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargets,
    IHeaderPredicate,
} from "@gooddata/sdk-ui";
import { createMemoizedSelector } from "../_infra/selectors.js";
import { DashboardDrillDefinition } from "../../../types.js";
import { selectWidgetDrills } from "../layout/layoutSelectors.js";
import { selectDrillTargetsByWidgetRef } from "../drillTargets/drillTargetsSelectors.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectAttributesWithDisplayFormLink,
    selectAttributesWithDrillDown,
} from "../catalog/catalogSelectors.js";
import { selectDrillableItems } from "../drill/drillSelectors.js";
import {
    selectDisableDefaultDrills,
    selectEnableClickableAttributeURL,
    selectEnableKPIDashboardDrillToURL,
    selectEnableKPIDashboardDrillToInsight,
    selectEnableKPIDashboardDrillToDashboard,
    selectEnableKPIDashboardImplicitDrillDown,
    selectHideKpiDrillInEmbedded,
    selectIsEmbedded,
} from "../config/configSelectors.js";
import flatMap from "lodash/flatMap.js";
import { selectAccessibleDashboardsMap } from "../accessibleDashboards/accessibleDashboardsSelectors.js";
import { selectInsightsMap } from "../insights/insightsSelectors.js";
import { DashboardSelector } from "../types.js";

/**
 * @internal
 */
export interface IImplicitDrillWithPredicates {
    drillDefinition: DashboardDrillDefinition;
    predicates: IHeaderPredicate[];
}

function drillDefinitionToPredicates(drill: DrillDefinition): IHeaderPredicate[] {
    let origin: ObjRefInScope;
    if (isDrillFromMeasure(drill.origin)) {
        origin = drill.origin.measure;
    } else if (isDrillFromAttribute(drill.origin)) {
        origin = drill.origin.attribute;
    } else {
        throw new UnexpectedError("Unknown drill origin!");
    }

    // add drillable items for all three types of objRefs that the origin measure can be
    return compact([
        isLocalIdRef(origin) && HeaderPredicates.localIdentifierMatch(origin.localIdentifier),
        isIdentifierRef(origin) && HeaderPredicates.identifierMatch(origin.identifier),
        isUriRef(origin) && HeaderPredicates.uriMatch(origin.uri),
    ]);
}

function getDrillDownDefinitionsWithPredicates(
    availableDrillAttributes: IAvailableDrillTargetAttribute[],
    attributesWithDrillDown: Array<ICatalogAttribute | ICatalogDateAttribute>,
): IImplicitDrillWithPredicates[] {
    const matchingAvailableDrillAttributes = availableDrillAttributes.filter((candidate) => {
        return attributesWithDrillDown.some((attr) =>
            areObjRefsEqual(attr.attribute.ref, candidate.attribute.attributeHeader.formOf.ref),
        );
    });

    return matchingAvailableDrillAttributes.map((drill): IImplicitDrillWithPredicates => {
        const matchingCatalogAttribute = attributesWithDrillDown.find((attr) =>
            areObjRefsEqual(attr.attribute.ref, drill.attribute.attributeHeader.formOf.ref),
        );

        return {
            drillDefinition: {
                type: "drillDown",
                origin: localIdRef(drill.attribute.attributeHeader.localIdentifier),
                target: matchingCatalogAttribute!.attribute.drillDownStep!,
            },
            predicates: [
                HeaderPredicates.localIdentifierMatch(drill.attribute.attributeHeader.localIdentifier),
            ],
        };
    });
}

function getDrillToUrlDefinitionsWithPredicates(
    availableDrillAttributes: IAvailableDrillTargetAttribute[],
    attributesWithDisplayFormLink: Array<ICatalogAttribute>,
): IImplicitDrillWithPredicates[] {
    const matchingAvailableDrillAttributes = availableDrillAttributes.filter((candidate) => {
        return attributesWithDisplayFormLink.some((attr) =>
            areObjRefsEqual(attr.attribute.ref, candidate.attribute.attributeHeader.formOf.ref),
        );
    });

    return matchingAvailableDrillAttributes.map((targetAttribute): IImplicitDrillWithPredicates => {
        const matchingCatalogAttribute = attributesWithDisplayFormLink.find((attr) =>
            areObjRefsEqual(attr.attribute.ref, targetAttribute.attribute.attributeHeader.formOf.ref),
        );

        const drillDefinition: IDrillToAttributeUrl = {
            type: "drillToAttributeUrl",
            transition: "new-window",
            origin: {
                type: "drillFromAttribute",
                attribute: localIdRef(targetAttribute.attribute.attributeHeader.localIdentifier),
            },
            target: {
                displayForm: targetAttribute.attribute.attributeHeader.ref,
                hyperlinkDisplayForm: matchingCatalogAttribute!.attribute.drillToAttributeLink!,
            },
        };

        return {
            drillDefinition,
            predicates: [
                // add drillable items for both types of objRefs that the header can be
                HeaderPredicates.identifierMatch(targetAttribute.attribute.attributeHeader.identifier),
                HeaderPredicates.uriMatch(targetAttribute.attribute.attributeHeader.uri),
            ],
        };
    });
}

function getDrillDefinitionsWithPredicates(
    insightWidgetDrills: DrillDefinition[],
): IImplicitDrillWithPredicates[] {
    return insightWidgetDrills.map((drill): IImplicitDrillWithPredicates => {
        return {
            drillDefinition: drill,
            predicates: drillDefinitionToPredicates(drill),
        };
    });
}

//
// Following selectors are for the 1st level insight widget (insight widget on the dashboard)
//

/**
 * @internal
 */
export const selectImplicitDrillsDownByWidgetRef: (
    ref: ObjRef,
) => DashboardSelector<IImplicitDrillWithPredicates[]> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectDrillTargetsByWidgetRef(ref),
        selectAttributesWithDrillDown,
        selectEnableKPIDashboardImplicitDrillDown,
        (availableDrillTargets, attributesWithDrillDown, isKPIDashboardImplicitDrillDown) => {
            if (isKPIDashboardImplicitDrillDown) {
                const availableDrillAttributes =
                    availableDrillTargets?.availableDrillTargets?.attributes ?? [];
                return getDrillDownDefinitionsWithPredicates(
                    availableDrillAttributes,
                    attributesWithDrillDown,
                );
            }

            return [];
        },
    ),
);

/**
 * @internal
 */
export const selectImplicitDrillsToUrlByWidgetRef: (
    ref: ObjRef,
) => DashboardSelector<IImplicitDrillWithPredicates[]> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectDrillTargetsByWidgetRef(ref),
        selectAttributesWithDisplayFormLink,
        selectEnableClickableAttributeURL,
        (availableDrillTargets, attributesWithLink, isClickableAttributeURLEnabled) => {
            if (isClickableAttributeURLEnabled) {
                const availableDrillAttributes =
                    availableDrillTargets?.availableDrillTargets?.attributes ?? [];
                return getDrillToUrlDefinitionsWithPredicates(availableDrillAttributes, attributesWithLink);
            }

            return [];
        },
    ),
);

/**
 * @internal
 */
export const selectConfiguredDrillsByWidgetRef: (
    ref: ObjRef,
) => DashboardSelector<IImplicitDrillWithPredicates[]> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectWidgetDrills(ref),
        selectDisableDefaultDrills,
        selectEnableClickableAttributeURL,
        selectEnableKPIDashboardDrillToURL,
        selectEnableKPIDashboardDrillToInsight,
        selectEnableKPIDashboardDrillToDashboard,
        selectHideKpiDrillInEmbedded,
        selectIsEmbedded,
        (
            drills = [],
            disableDefaultDrills,
            enableClickableAttributeURL,
            enableKPIDashboardDrillToURL,
            enableKPIDashboardDrillToInsight,
            enableKPIDashboardDrillToDashboard,
            hideKpiDrillInEmbedded,
            isEmbedded,
        ) => {
            if (disableDefaultDrills) {
                return [];
            }

            const filteredDrills = [...drills].filter((drill) => {
                const drillType = drill.type;
                switch (drillType) {
                    case "drillToAttributeUrl": {
                        return enableClickableAttributeURL;
                    }
                    case "drillToCustomUrl": {
                        return enableKPIDashboardDrillToURL;
                    }
                    case "drillToDashboard": {
                        return enableKPIDashboardDrillToDashboard;
                    }
                    case "drillToInsight": {
                        return enableKPIDashboardDrillToInsight;
                    }
                    case "drillToLegacyDashboard": {
                        return !(isEmbedded && hideKpiDrillInEmbedded);
                    }
                    default: {
                        const unhandledType: never = drillType;
                        throw new UnexpectedError(`Unhandled widget drill type: ${unhandledType}`);
                    }
                }
            });

            return getDrillDefinitionsWithPredicates(filteredDrills);
        },
    ),
);

/**
 * @internal
 */
export const selectValidConfiguredDrillsByWidgetRef: (
    ref: ObjRef,
) => DashboardSelector<IImplicitDrillWithPredicates[]> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectConfiguredDrillsByWidgetRef(ref),
        selectAllCatalogDisplayFormsMap,
        selectAccessibleDashboardsMap,
        selectInsightsMap,
        (drills = [], displayFormsMap, accessibleDashboardsMap, insightsMap) => {
            return drills.filter((drill) => {
                switch (drill.drillDefinition.type) {
                    case "drillToAttributeUrl": {
                        return displayFormsMap.get(drill.drillDefinition.target.hyperlinkDisplayForm);
                    }
                    case "drillToCustomUrl": {
                        return true;
                    }
                    case "drillToDashboard": {
                        // No drill target equals drill to the same dashboard
                        return (
                            !drill.drillDefinition.target ||
                            accessibleDashboardsMap.get(drill.drillDefinition.target)
                        );
                    }
                    case "drillToInsight": {
                        return insightsMap.get(drill.drillDefinition.target);
                    }
                    case "drillToLegacyDashboard": {
                        return true;
                    }
                    case "drillDown": {
                        return true;
                    }
                    default: {
                        const unhandledType: never = drill.drillDefinition;
                        throw new UnexpectedError(`Unhandled widget drill type: ${unhandledType}`);
                    }
                }
            });
        },
    ),
);

const selectImplicitDrillToUrlPredicates = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectImplicitDrillsToUrlByWidgetRef(ref), (drillToUrlDrills) => {
        return flatMap(drillToUrlDrills, (drill) => drill.predicates);
    }),
);

const selectImplicitDrillDownPredicates = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectImplicitDrillsDownByWidgetRef(ref), (drillDownDrills) => {
        return flatMap(drillDownDrills, (drill) => drill.predicates);
    }),
);

const selectConfiguredDrillPredicates = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectValidConfiguredDrillsByWidgetRef(ref), (configuredDrills = []) => {
        return flatMap(configuredDrills, (drill) => drill.predicates);
    }),
);

/**
 * @internal
 */
export const selectConfiguredAndImplicitDrillsByWidgetRef: (
    ref: ObjRef,
) => DashboardSelector<IImplicitDrillWithPredicates[]> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectValidConfiguredDrillsByWidgetRef(ref),
        selectImplicitDrillsDownByWidgetRef(ref),
        selectImplicitDrillsToUrlByWidgetRef(ref),
        (configuredDrills, implicitDrillDownDrills, implicitDrillToUrlDrills) => {
            return [...configuredDrills, ...implicitDrillDownDrills, ...implicitDrillToUrlDrills];
        },
    ),
);

/**
 * @internal
 */
export const selectDrillableItemsByWidgetRef: (ref: ObjRef) => DashboardSelector<ExplicitDrill[]> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(
            selectDisableDefaultDrills,
            selectDrillableItems,
            selectConfiguredDrillPredicates(ref),
            selectImplicitDrillDownPredicates(ref),
            selectImplicitDrillToUrlPredicates(ref),
            (
                disableDefaultDrills,
                drillableItems,
                configuredDrills,
                implicitDrillDownDrills,
                implicitDrillToUrlDrills,
            ) => {
                const resolvedDrillableItems = [...drillableItems];

                if (!disableDefaultDrills) {
                    resolvedDrillableItems.push(
                        ...configuredDrills,
                        ...implicitDrillDownDrills,
                        ...implicitDrillToUrlDrills,
                    );
                }

                return resolvedDrillableItems;
            },
        ),
    );

//
// Following selectors are for insight widget in drill dialog
//

/**
 * @internal
 */
export const selectImplicitDrillsByAvailableDrillTargets: (
    availableDrillTargets: IAvailableDrillTargets | undefined,
) => DashboardSelector<IImplicitDrillWithPredicates[]> = createMemoizedSelector(
    (availableDrillTargets: IAvailableDrillTargets | undefined) =>
        createSelector(
            selectAttributesWithDrillDown,
            selectAttributesWithDisplayFormLink,
            (attributesWithDrillDown, attributesWithLink) => {
                const availableDrillAttributes = availableDrillTargets?.attributes ?? [];
                const drillDownDrills = getDrillDownDefinitionsWithPredicates(
                    availableDrillAttributes,
                    attributesWithDrillDown,
                );
                const drillToUrlDrills = getDrillToUrlDefinitionsWithPredicates(
                    availableDrillAttributes,
                    attributesWithLink,
                );

                return [...drillDownDrills, ...drillToUrlDrills];
            },
        ),
);

/**
 * @internal
 */
export const selectDrillableItemsByAvailableDrillTargets: (
    availableDrillTargets: IAvailableDrillTargets | undefined,
) => DashboardSelector<IHeaderPredicate[]> = createMemoizedSelector(
    (availableDrillTargets: IAvailableDrillTargets | undefined) =>
        createSelector(
            selectImplicitDrillsByAvailableDrillTargets(availableDrillTargets),
            (implicitDrillDowns) => {
                return flatMap(implicitDrillDowns, (implicitDrill) => implicitDrill.predicates);
            },
        ),
);
