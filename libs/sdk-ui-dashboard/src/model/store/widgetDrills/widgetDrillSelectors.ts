// (C) 2020-2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import compact from "lodash/compact";
import {
    DrillDefinition,
    ICatalogAttribute,
    ICatalogDateAttribute,
    IDrillToAttributeUrl,
    isDrillFromAttribute,
    isDrillFromMeasure,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    isLocalIdRef,
    isIdentifierRef,
    isUriRef,
    ObjRef,
    areObjRefsEqual,
    ObjRefInScope,
    localIdRef,
} from "@gooddata/sdk-model";
import {
    HeaderPredicates,
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargets,
    IHeaderPredicate,
} from "@gooddata/sdk-ui";
import { createMemoizedSelector } from "../_infra/selectors";
import { DashboardDrillDefinition } from "../../../types";
import { selectWidgetDrills } from "../layout/layoutSelectors";
import { selectDrillTargetsByWidgetRef } from "../drillTargets/drillTargetsSelectors";
import {
    selectAttributesWithDisplayFormLink,
    selectAttributesWithDrillDown,
} from "../catalog/catalogSelectors";
import { selectDrillableItems } from "../drill/drillSelectors";
import {
    selectDisableDefaultDrills,
    selectEnableClickableAttributeURL,
    selectEnableKPIDashboardDrillToURL,
    selectEnableKPIDashboardDrillToInsight,
    selectEnableKPIDashboardDrillToDashboard,
    selectEnableKPIDashboardImplicitDrillDown,
    selectHideKpiDrillInEmbedded,
    selectIsEmbedded,
} from "../config/configSelectors";
import flatMap from "lodash/flatMap";

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
                // add drillable items for both types of objRefs that the header can be
                HeaderPredicates.identifierMatch(drill.attribute.attributeHeader.identifier),
                HeaderPredicates.uriMatch(drill.attribute.attributeHeader.uri),
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
export const selectImplicitDrillsDownByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
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
export const selectImplicitDrillsToUrlByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
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
export const selectConfiguredDrillsByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
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
    createSelector(selectConfiguredDrillsByWidgetRef(ref), (configuredDrills = []) => {
        return flatMap(configuredDrills, (drill) => drill.predicates);
    }),
);

/**
 * @internal
 */
export const selectConfiguredAndImplicitDrillsByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectConfiguredDrillsByWidgetRef(ref),
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
export const selectDrillableItemsByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
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
export const selectImplicitDrillsByAvailableDrillTargets = createMemoizedSelector(
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
export const selectDrillableItemsByAvailableDrillTargets = createMemoizedSelector(
    (availableDrillTargets: IAvailableDrillTargets | undefined) =>
        createSelector(
            selectImplicitDrillsByAvailableDrillTargets(availableDrillTargets),
            (implicitDrillDowns) => {
                const drillableItems = flatMap(
                    implicitDrillDowns,
                    (implicitDrill) => implicitDrill.predicates,
                );
                return drillableItems;
            },
        ),
);
