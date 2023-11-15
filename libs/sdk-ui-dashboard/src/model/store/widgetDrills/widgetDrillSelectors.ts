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
    objRefToString,
    ICatalogAttributeHierarchy,
    IDrillDownReference,
    isAttributeHierarchyReference,
} from "@gooddata/sdk-model";
import {
    ExplicitDrill,
    HeaderPredicates,
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargets,
    IHeaderPredicate,
} from "@gooddata/sdk-ui";
import { createMemoizedSelector } from "../_infra/selectors.js";
import { DashboardDrillDefinition, IGlobalDrillDownAttributeHierarchyDefinition } from "../../../types.js";
import {
    selectIgnoredDrillDownHierarchiesByWidgetRef,
    selectWidgetDrills,
} from "../layout/layoutSelectors.js";
import { selectDrillTargetsByWidgetRef } from "../drillTargets/drillTargetsSelectors.js";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
    selectAttributesWithDisplayFormLink,
    selectAttributesWithHierarchyDescendants,
    selectAttributesWithHierarchyDescendantsByWidgetRef,
    selectCatalogAttributeHierarchies,
} from "../catalog/catalogSelectors.js";
import { selectDrillableItems } from "../drill/drillSelectors.js";
import {
    selectDisableDefaultDrills,
    selectEnableClickableAttributeURL,
    selectEnableKPIDashboardDrillToURL,
    selectEnableKPIDashboardDrillToInsight,
    selectEnableKPIDashboardDrillToDashboard,
    selectIsDrillDownEnabled,
    selectHideKpiDrillInEmbedded,
    selectIsEmbedded,
    selectEnableAttributeHierarchies,
} from "../config/configSelectors.js";
import flatMap from "lodash/flatMap.js";
import { selectAccessibleDashboardsMap } from "../accessibleDashboards/accessibleDashboardsSelectors.js";
import { selectInsightsMap } from "../insights/insightsSelectors.js";
import { DashboardSelector } from "../types.js";
import { ObjRefMap } from "../../../_staging/metadata/objRefMap.js";
import { selectSupportsAttributeHierarchies } from "../backendCapabilities/backendCapabilitiesSelectors.js";

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
    attributesWithHierarchyDescendants: Record<string, ObjRef[]>,
    allCatalogAttributesMap: ObjRefMap<ICatalogAttribute | ICatalogDateAttribute>,
): IImplicitDrillWithPredicates[] {
    const matchingAvailableDrillAttributes = availableDrillAttributes.filter(
        (candidate) =>
            objRefToString(candidate.attribute.attributeHeader.formOf.ref) in
            attributesWithHierarchyDescendants,
    );

    return matchingAvailableDrillAttributes.flatMap((drill) => {
        const attributeDrillDescendants =
            attributesWithHierarchyDescendants[objRefToString(drill.attribute.attributeHeader.formOf.ref)];

        return attributeDrillDescendants.map((descendantRef): IImplicitDrillWithPredicates => {
            /**
             * Here we need to distinguish how the drill is defined in the attribute hierarchy.
             *
             * On Tiger, the drilldown is defined as "Attr --\> Attr" (so we take the default display form as the drill target)
             * On Bear, the drilldown is defined as "Attr --\> specific display form" (= drill target implicitly)
             */
            const drillTargetAttributeFromCatalog = allCatalogAttributesMap.get(descendantRef);
            const drillTargetDescriptionObj = drillTargetAttributeFromCatalog
                ? {
                      target: drillTargetAttributeFromCatalog.defaultDisplayForm.ref,
                      title: drillTargetAttributeFromCatalog.attribute.title, // title is used to distinguish between multiple drill-downs
                  }
                : {
                      target: descendantRef,
                  };

            return {
                drillDefinition: {
                    type: "drillDown",
                    origin: localIdRef(drill.attribute.attributeHeader.localIdentifier),
                    ...drillTargetDescriptionObj,
                },
                predicates: [
                    HeaderPredicates.localIdentifierMatch(drill.attribute.attributeHeader.localIdentifier),
                ],
            };
        });
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

function getGlobalDrillDownAttributeHierarchyDefinitions(
    catalogAttributeHierarchies: ICatalogAttributeHierarchy[],
    availableDrillTargets?: IAvailableDrillTargets,
    ignoredDrillDownHierarchies: IDrillDownReference[] = [],
) {
    const availableAttributes = availableDrillTargets?.attributes ?? [];
    const globalDrillDowns: IGlobalDrillDownAttributeHierarchyDefinition[] = [];
    catalogAttributeHierarchies
        .map((it) => ({
            // we need to remove the last attribute from the hierarchy
            // because it does not have any descendants so that the widget cannot drill down to it
            attributeIdentifiers: it.attributeHierarchy.attributes
                .slice(0, it.attributeHierarchy.attributes.length - 1)
                .map((it) => objRefToString(it)),
            ref: it.attributeHierarchy.ref,
        }))
        .forEach(({ attributeIdentifiers, ref }) => {
            availableAttributes.forEach((availableAttribute) => {
                const attributeHeader = availableAttribute.attribute.attributeHeader;
                const isAttributeInHierarchy = attributeIdentifiers.includes(
                    objRefToString(attributeHeader.formOf.ref),
                );
                const inBlacklistIndex = ignoredDrillDownHierarchies.findIndex((reference) => {
                    if (isAttributeHierarchyReference(reference)) {
                        return (
                            areObjRefsEqual(reference.attributeHierarchy, ref) &&
                            objRefToString(reference.label) === attributeHeader.identifier
                        );
                    } else {
                        return (
                            areObjRefsEqual(reference.dateHierarchyTemplate, ref) &&
                            objRefToString(reference.dateDatasetAttribute) === attributeHeader.identifier
                        );
                    }
                });
                if (isAttributeInHierarchy && inBlacklistIndex < 0) {
                    globalDrillDowns.push({
                        type: "drillDown",
                        origin: localIdRef(attributeHeader.localIdentifier),
                        target: ref,
                    });
                }
            });
        });

    return globalDrillDowns;
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
        selectAttributesWithHierarchyDescendantsByWidgetRef(ref),
        selectAllCatalogAttributesMap,
        selectIsDrillDownEnabled,
        (
            availableDrillTargets,
            attributesWithHierarchyDescendants,
            allCatalogAttributesMap,
            isDrillDownEnabled,
        ) => {
            if (isDrillDownEnabled) {
                const availableDrillAttributes =
                    availableDrillTargets?.availableDrillTargets?.attributes ?? [];
                return getDrillDownDefinitionsWithPredicates(
                    availableDrillAttributes,
                    attributesWithHierarchyDescendants,
                    allCatalogAttributesMap,
                );
            }

            return [];
        },
    ),
);

/**
 * @internal
 */
export const selectGlobalDrillsDownAttributeHierarchyByWidgetRef: (
    ref: ObjRef,
) => DashboardSelector<IGlobalDrillDownAttributeHierarchyDefinition[]> = createMemoizedSelector(
    (ref: ObjRef) =>
        createSelector(
            selectDrillTargetsByWidgetRef(ref),
            selectCatalogAttributeHierarchies,
            selectIgnoredDrillDownHierarchiesByWidgetRef(ref),
            selectEnableAttributeHierarchies,
            selectSupportsAttributeHierarchies,
            (
                availableDrillTargets,
                catalogAttributeHierarchies,
                ignoredDrillDownHierarchies,
                enableAttributeHierarchies,
                supportAttributeHierarchies,
            ) => {
                if (enableAttributeHierarchies && supportAttributeHierarchies) {
                    return getGlobalDrillDownAttributeHierarchyDefinitions(
                        catalogAttributeHierarchies,
                        availableDrillTargets?.availableDrillTargets,
                        ignoredDrillDownHierarchies,
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
    ignoredDrillDownHierarchies: IDrillDownReference[] | undefined,
) => DashboardSelector<IImplicitDrillWithPredicates[]> = createMemoizedSelector(
    (
        availableDrillTargets: IAvailableDrillTargets | undefined,
        ignoredDrillDownHierarchies: IDrillDownReference[] | undefined,
    ) =>
        createSelector(
            selectAttributesWithDisplayFormLink,
            selectAttributesWithHierarchyDescendants(ignoredDrillDownHierarchies),
            selectAllCatalogAttributesMap,
            selectIsDrillDownEnabled,
            (
                attributesWithLink,
                attributesWithHierarchyDescendants,
                allCatalogAttributesMap,
                isDrillDownEnabled,
            ) => {
                const availableDrillAttributes = availableDrillTargets?.attributes ?? [];
                const drillDownDrills = isDrillDownEnabled
                    ? getDrillDownDefinitionsWithPredicates(
                          availableDrillAttributes,
                          attributesWithHierarchyDescendants,
                          allCatalogAttributesMap,
                      )
                    : [];
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
    ignoredDrillDownHierarchies: IDrillDownReference[] | undefined,
) => DashboardSelector<IHeaderPredicate[]> = createMemoizedSelector(
    (
        availableDrillTargets: IAvailableDrillTargets | undefined,
        ignoredDrillDownHierarchies: IDrillDownReference[] | undefined,
    ) =>
        createSelector(
            selectImplicitDrillsByAvailableDrillTargets(availableDrillTargets, ignoredDrillDownHierarchies),
            (implicitDrillDowns) => {
                return flatMap(implicitDrillDowns, (implicitDrill) => implicitDrill.predicates);
            },
        ),
);
