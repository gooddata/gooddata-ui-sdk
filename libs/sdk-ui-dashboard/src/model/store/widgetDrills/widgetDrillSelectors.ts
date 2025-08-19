// (C) 2020-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import compact from "lodash/compact.js";
import flatMap from "lodash/flatMap.js";

import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    DrillDefinition,
    DrillOrigin,
    ICatalogAttribute,
    ICatalogAttributeHierarchy,
    ICatalogDateAttribute,
    ICatalogDateAttributeHierarchy,
    IDrillDownReference,
    IDrillToAttributeUrl,
    ObjRef,
    ObjRefInScope,
    areObjRefsEqual,
    getHierarchyAttributes,
    getHierarchyRef,
    isDrillFromAttribute,
    isDrillFromMeasure,
    isIdentifierRef,
    isLocalIdRef,
    isUriRef,
    localIdRef,
    objRefToString,
} from "@gooddata/sdk-model";
import {
    ExplicitDrill,
    HeaderPredicates,
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargets,
    IHeaderPredicate,
} from "@gooddata/sdk-ui";

import { ObjRefMap } from "../../../_staging/metadata/objRefMap.js";
import { DashboardDrillDefinition, IGlobalDrillDownAttributeHierarchyDefinition } from "../../../types.js";
import { existBlacklistHierarchyPredicate } from "../../utils/attributeHierarchyUtils.js";
import { createMemoizedSelector } from "../_infra/selectors.js";
import {
    selectAccessibleDashboardsLoaded,
    selectAccessibleDashboardsMap,
} from "../accessibleDashboards/accessibleDashboardsSelectors.js";
import {
    selectBackendCapabilities,
    selectSupportsAttributeHierarchies,
    selectSupportsCrossFiltering,
} from "../backendCapabilities/backendCapabilitiesSelectors.js";
import {
    HierarchyDescendant,
    HierarchyDescendantsByAttributeId,
    selectAllCatalogAttributeHierarchies,
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
    selectAttributesWithDisplayFormLink,
    selectAttributesWithHierarchyDescendants,
    selectCatalogIsLoaded,
} from "../catalog/catalogSelectors.js";
import {
    selectDisableDefaultDrills,
    selectEnableClickableAttributeURL,
    selectEnableKDCrossFiltering,
    selectEnableKPIDashboardDrillToDashboard,
    selectEnableKPIDashboardDrillToInsight,
    selectEnableKPIDashboardDrillToURL,
    selectHideKpiDrillInEmbedded,
    selectIsDisabledCrossFiltering,
    selectIsDrillDownEnabled,
    selectIsEmbedded,
} from "../config/configSelectors.js";
import { selectDrillableItems } from "../drill/drillSelectors.js";
import { selectDrillTargetsByWidgetRef } from "../drillTargets/drillTargetsSelectors.js";
import { selectInsightByWidgetRef, selectInsightsMap } from "../insights/insightsSelectors.js";
import {
    selectIgnoredDrillDownHierarchiesByWidgetRef,
    selectWidgetDrills,
} from "../layout/layoutSelectors.js";
import { selectDisableDashboardCrossFiltering } from "../meta/metaSelectors.js";
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

function createDrillDefinition(
    drill: IAvailableDrillTargetAttribute,
    descendantRef: ObjRef,
    allCatalogAttributesMap: ObjRefMap<ICatalogAttribute | ICatalogDateAttribute>,
    hierarchyRef: ObjRef,
): IImplicitDrillWithPredicates {
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

    const hierarchyRefObj = { hierarchyRef };

    return {
        drillDefinition: {
            type: "drillDown",
            origin: localIdRef(drill.attribute.attributeHeader.localIdentifier),
            ...drillTargetDescriptionObj,
            ...hierarchyRefObj,
        },
        predicates: [HeaderPredicates.localIdentifierMatch(drill.attribute.attributeHeader.localIdentifier)],
    };
}

function getDrillDownDefinitionsWithPredicates(
    availableDrillAttributes: IAvailableDrillTargetAttribute[],
    attributesWithHierarchyDescendants: HierarchyDescendantsByAttributeId,
    allCatalogAttributesMap: ObjRefMap<ICatalogAttribute | ICatalogDateAttribute>,
    allCatalogAttributeHierarchies: (ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy)[],
    ignoredDrillDownHierarchies: IDrillDownReference[],
    supportsAttributeHierarchies?: boolean,
): IImplicitDrillWithPredicates[] {
    // generate targets on the fly if ignored hierarchies are present
    // this allows to have `selectAttributesWithHierarchyDescendants` be universal and
    // be computed only once and not respect the ignores during creation.
    // For the future, we may consider not creating this at all and always generate on the fly.
    if (ignoredDrillDownHierarchies?.length) {
        return availableDrillAttributes.flatMap((drill) => {
            const attributeRef = drill.attribute.attributeHeader.formOf.ref;
            const attributeDescendants: HierarchyDescendant[] = [];
            allCatalogAttributeHierarchies.forEach((hierarchy) => {
                const attributes = getHierarchyAttributes(hierarchy);
                const hierarchyRef = getHierarchyRef(hierarchy);
                const hierarchyAttributes = attributes.filter((attrRef) => {
                    const ignoredIndex = ignoredDrillDownHierarchies.findIndex((reference) =>
                        existBlacklistHierarchyPredicate(reference, hierarchy, attrRef),
                    );

                    if (supportsAttributeHierarchies) {
                        const attribueHierarchyExist = allCatalogAttributesMap.get(attrRef);

                        return ignoredIndex < 0 && attribueHierarchyExist;
                    } else {
                        return ignoredIndex < 0;
                    }
                });

                const foundAttributeIndex = hierarchyAttributes.findIndex((ref) =>
                    areObjRefsEqual(ref, attributeRef),
                );

                if (foundAttributeIndex < 0) {
                    return;
                }

                const foundDescendant = hierarchyAttributes[foundAttributeIndex + 1];

                if (!foundDescendant) {
                    return;
                }

                attributeDescendants.push({ hierarchyRef, descendantRef: foundDescendant });
            });

            return attributeDescendants.map((descendant) => {
                return createDrillDefinition(
                    drill,
                    descendant.descendantRef,
                    allCatalogAttributesMap,
                    descendant.hierarchyRef,
                );
            });
        });
    }

    const matchingAvailableDrillAttributes = availableDrillAttributes.filter(
        (candidate) =>
            objRefToString(candidate.attribute.attributeHeader.formOf.ref) in
            attributesWithHierarchyDescendants,
    );

    return matchingAvailableDrillAttributes.flatMap((drill) => {
        const drillRef = drill.attribute.attributeHeader.formOf.ref;
        const attributeDrillDescendants = attributesWithHierarchyDescendants[objRefToString(drillRef)];

        return attributeDrillDescendants.map((descendantRef): IImplicitDrillWithPredicates => {
            return createDrillDefinition(
                drill,
                descendantRef.descendantRef,
                allCatalogAttributesMap,
                descendantRef.hierarchyRef,
            );
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
    catalogAttributeHierarchies: (ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy)[],
    availableDrillTargets?: IAvailableDrillTargets,
    ignoredDrillDownHierarchies: IDrillDownReference[] = [],
) {
    const availableAttributes = availableDrillTargets?.attributes ?? [];
    const globalDrillDowns: IGlobalDrillDownAttributeHierarchyDefinition[] = [];
    catalogAttributeHierarchies
        .map((it) => {
            const attributes = getHierarchyAttributes(it);
            // we need to remove the last attribute from the hierarchy
            // because it does not have any descendants so that the widget cannot drill down to it
            return {
                attributeRefs: attributes.slice(0, attributes.length - 1),
                hierarchy: it,
            };
        })
        .forEach(({ attributeRefs, hierarchy }) => {
            availableAttributes.forEach((availableAttribute) => {
                const attributeHeader = availableAttribute.attribute.attributeHeader;
                const isAttributeInHierarchy = attributeRefs.some((attrRef) =>
                    areObjRefsEqual(attrRef, attributeHeader.formOf.ref),
                );
                const inBlacklistIndex = ignoredDrillDownHierarchies.findIndex((reference) =>
                    existBlacklistHierarchyPredicate(reference, hierarchy, attributeHeader.formOf.ref),
                );
                if (isAttributeInHierarchy && inBlacklistIndex < 0) {
                    const hierarchyRef = getHierarchyRef(hierarchy);
                    globalDrillDowns.push({
                        type: "drillDown",
                        origin: localIdRef(attributeHeader.localIdentifier),
                        target: hierarchyRef,
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
        selectAttributesWithHierarchyDescendants,
        selectAllCatalogAttributesMap,
        selectIsDrillDownEnabled,
        selectInsightByWidgetRef(ref),
        selectIgnoredDrillDownHierarchiesByWidgetRef(ref),
        selectAllCatalogAttributeHierarchies,
        selectBackendCapabilities,
        (
            availableDrillTargets,
            attributesWithHierarchyDescendants,
            allCatalogAttributesMap,
            isDrillDownEnabled,
            widgetInsight,
            ignoredHierarchies,
            allCatalogAttributeHierarchies,
            backendCapabilities,
        ) => {
            const isWidgetEnableDrillDown = !widgetInsight?.insight?.properties?.controls?.disableDrillDown;
            if (isDrillDownEnabled && isWidgetEnableDrillDown) {
                const availableDrillAttributes =
                    availableDrillTargets?.availableDrillTargets?.attributes ?? [];

                return getDrillDownDefinitionsWithPredicates(
                    availableDrillAttributes,
                    attributesWithHierarchyDescendants,
                    allCatalogAttributesMap,
                    allCatalogAttributeHierarchies,
                    ignoredHierarchies,
                    backendCapabilities.supportsAttributeHierarchies,
                );
            }

            return [];
        },
    ),
);

const selectCrossFilteringByWidgetRef: (
    ref: ObjRef,
) => DashboardSelector<IImplicitDrillWithPredicates | undefined> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectEnableKDCrossFiltering,
        selectSupportsCrossFiltering,
        selectDrillTargetsByWidgetRef(ref),
        selectDisableDashboardCrossFiltering,
        selectIsDisabledCrossFiltering,
        selectDrillableItems,
        (
            isCrossFilteringEnabled,
            isCrossFilteringSupported,
            availableDrillTargets,
            disableCrossFiltering,
            disableCrossFilteringByConfig,
            drillableItems,
        ) => {
            if (
                !isCrossFilteringEnabled ||
                !isCrossFilteringSupported ||
                disableCrossFiltering ||
                disableCrossFilteringByConfig ||
                // When some drillable items are present, we need to disable
                // cross filtering so that drill events are still possible to do.
                drillableItems.length > 0
            ) {
                return undefined;
            }

            const availableDrillAttributes = availableDrillTargets?.availableDrillTargets?.attributes ?? [];
            const availableDrillAttributesWithoutDates = availableDrillAttributes.filter(
                (drill) => !drill.attribute.attributeHeader.granularity,
            );

            if (!availableDrillAttributesWithoutDates.length) {
                return undefined;
            }

            // construct predicates for all available attributes and measures
            const attributePredicates = availableDrillAttributesWithoutDates.map((drillAttribute) =>
                HeaderPredicates.localIdentifierMatch(
                    drillAttribute.attribute.attributeHeader.localIdentifier,
                ),
            );
            const measurePredicates = compact(
                availableDrillTargets?.availableDrillTargets?.measures?.map((drillMeasure) =>
                    HeaderPredicates.localIdentifierMatch(
                        drillMeasure.measure.measureHeaderItem.localIdentifier,
                    ),
                ),
            );

            return {
                drillDefinition: {
                    type: "crossFiltering",
                    transition: "in-place",
                    origin: {} as DrillOrigin, // not needed for cross filtering
                },
                predicates: [...attributePredicates, ...measurePredicates],
            };
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
            selectAllCatalogAttributeHierarchies,
            selectIgnoredDrillDownHierarchiesByWidgetRef(ref),
            selectSupportsAttributeHierarchies,
            selectInsightByWidgetRef(ref),
            (
                availableDrillTargets,
                catalogAttributeHierarchies,
                ignoredDrillDownHierarchies,
                supportAttributeHierarchies,
                widgetInsight,
            ) => {
                const isWidgetEnableDrillDown =
                    !widgetInsight?.insight?.properties?.controls?.disableDrillDown;
                const enableDrillDown = supportAttributeHierarchies && isWidgetEnableDrillDown;
                if (enableDrillDown) {
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
        selectEnableKDCrossFiltering,
        selectHideKpiDrillInEmbedded,
        selectIsEmbedded,
        selectDisableDashboardCrossFiltering,
        selectIsDisabledCrossFiltering,
        (
            drills = [],
            disableDefaultDrills,
            enableClickableAttributeURL,
            enableKPIDashboardDrillToURL,
            enableKPIDashboardDrillToInsight,
            enableKPIDashboardDrillToDashboard,
            enableKDCrossFiltering,
            hideKpiDrillInEmbedded,
            isEmbedded,
            disableCrossFiltering,
            disableCrossFilteringByConfig,
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
                    case "crossFiltering": {
                        return (
                            enableKDCrossFiltering && !disableCrossFiltering && !disableCrossFilteringByConfig
                        );
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
                    case "crossFiltering": {
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

const selectCrossFilteringPredicates = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectCrossFilteringByWidgetRef(ref), (drill) => {
        return drill?.predicates ?? [];
    }),
);

/**
 * @internal
 */
export const selectConfiguredAndImplicitDrillsByWidgetRef: (
    ref: ObjRef,
) => DashboardSelector<IImplicitDrillWithPredicates[]> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectCatalogIsLoaded,
        selectAccessibleDashboardsLoaded,
        selectValidConfiguredDrillsByWidgetRef(ref),
        selectImplicitDrillsDownByWidgetRef(ref),
        selectImplicitDrillsToUrlByWidgetRef(ref),
        selectCrossFilteringByWidgetRef(ref),
        (
            catalogIsLoaded,
            accessibleDashboardsLoaded,
            configuredDrills,
            implicitDrillDownDrills,
            implicitDrillToUrlDrills,
            crossFiltering,
        ) => {
            // disable drilling until all necessary items are loaded (catalog, dash list, ...)
            const drillActive = catalogIsLoaded && accessibleDashboardsLoaded;
            return drillActive
                ? compact([
                      ...configuredDrills,
                      ...implicitDrillDownDrills,
                      ...implicitDrillToUrlDrills,
                      crossFiltering,
                  ])
                : [];
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
            selectCrossFilteringPredicates(ref),
            (
                disableDefaultDrills,
                drillableItems,
                configuredDrills,
                implicitDrillDownDrills,
                implicitDrillToUrlDrills,
                crossFilteringDrills,
            ) => {
                const resolvedDrillableItems = [...drillableItems];

                if (!disableDefaultDrills) {
                    resolvedDrillableItems.push(
                        ...configuredDrills,
                        ...implicitDrillDownDrills,
                        ...implicitDrillToUrlDrills,
                        ...crossFilteringDrills,
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
        ignoredDrillDownHierarchies: IDrillDownReference[] | undefined = [],
    ) =>
        createSelector(
            selectAttributesWithDisplayFormLink,
            selectAttributesWithHierarchyDescendants,
            selectAllCatalogAttributesMap,
            selectIsDrillDownEnabled,
            selectAllCatalogAttributeHierarchies,
            selectBackendCapabilities,
            (
                attributesWithLink,
                attributesWithHierarchyDescendants,
                allCatalogAttributesMap,
                isDrillDownEnabled,
                allCatalogHierarchies,
                backendCapabilities,
            ) => {
                const availableDrillAttributes = availableDrillTargets?.attributes ?? [];
                const drillDownDrills = isDrillDownEnabled
                    ? getDrillDownDefinitionsWithPredicates(
                          availableDrillAttributes,
                          attributesWithHierarchyDescendants,
                          allCatalogAttributesMap,
                          allCatalogHierarchies,
                          ignoredDrillDownHierarchies,
                          backendCapabilities.supportsAttributeHierarchies,
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
