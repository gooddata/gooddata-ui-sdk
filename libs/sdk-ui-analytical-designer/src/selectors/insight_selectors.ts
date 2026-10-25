// (C) 2020-2026 GoodData Corporation

// TODO replace by backend agnostic logic - this is just a quick win type of solution
import invariant from "invariant";
import { omit } from "lodash-es";
import { createSelector } from "reselect";

import { type IRawExportCustomOverride, type IRawExportCustomOverrides } from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    type IInsightDefinition,
    type IVisualizationClass,
    type ObjRef,
    areObjRefsEqual,
    attributeAlias,
    attributeDisplayFormRef,
    attributeLocalId,
    insightBuckets,
    insightProperties,
    insightSanitize,
    insightSetLayers,
    insightSetProperties,
    insightVisualizationType,
    isAttribute,
    uriRef,
    visClassUrl,
} from "@gooddata/sdk-model";
import {
    VisualizationTypes,
    normalizeGeoInsightForRawExport as normalizeGeoInsightForRawExportBase,
} from "@gooddata/sdk-ui";

import { BackendToBearConvertors } from "../convertors/index.js";
import { getVisualizationClass as getVisualizationClassRaw } from "../services/visualization_class_service.js";
import { getAppliedSort, getSortConfig } from "../store/chart_sort/chart_sort_selector.js";
import { type IObjectMeta } from "../typings/bear/bearTypes.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IDecoratedBuckets,
} from "../typings/buckets.js";
import { type ICacheItemDisplayForm } from "../typings/state_objects.js";

import {
    currentReportMDObjectExtended,
    getDecoratedBucketsExtended,
    getStoredLayers,
} from "./buckets_selector.js";
import { canApplyCustomSort } from "./chart_sort_selectors.js";
import { enableGeoArea, enableNewGeoPushpin } from "./feature_flag_selector.js";
import {
    getLastSavedReportIdentifier,
    getLastSavedReportIsHidden,
    getLastSavedReportUri,
    getReportSummary,
    getReportTags,
    getReportTitle,
    isReportLockedSelector,
    openReportIdSelector,
} from "./report_selector.js";
import { VisualizationPropertiesSelectors } from "./visualization_properties_selector.js";

export const getVisualizationClass = createSelector(
    getVisualizationClassRaw,
    (visClassRaw): IVisualizationClass | undefined => {
        return visClassRaw ?? undefined;
    },
);

/**
 * This is fun. The extended reference point properties contain correct sort items, but not the rest of the properties.
 * While the 'properties' contain correct visualization properties and invalid sort items.
 *
 * The selector caters for this and creates the properties as a union of the correct information from the two
 * pieces of state.
 *
 * Additionally, if sort is customized by user via chart sorting dialog, this settings take precedent.
 *
 * For visualizations that don't support custom sort (like PivotTable), the preserved sortItems from
 * VISUALIZATION_PROPERTIES are used as the source of truth, since the extended reference point might have
 * empty sortItems after switching from another visualization type.
 */
const getInsightProperties = createSelector(
    VisualizationPropertiesSelectors.getExtendedReferencePointProperties,
    VisualizationPropertiesSelectors.getProperties,
    getAppliedSort,
    canApplyCustomSort,
    (refPointProperties, properties, appliedSort, applySort) => {
        // For visualizations that support custom sort, use appliedSort
        if (applySort) {
            return {
                ...omit(properties, ["sortItems"]),
                sortItems: appliedSort,
            };
        }

        // For visualizations that don't support custom sort (e.g., PivotTable),
        // prefer the preserved sortItems from properties (VISUALIZATION_PROPERTIES.sortItems)
        // over the extended reference point, which may be empty after switching vis types.
        const sortItems =
            properties["sortItems"]?.length > 0
                ? properties["sortItems"]
                : refPointProperties["sortItems"]?.length > 0
                  ? refPointProperties["sortItems"]
                  : undefined;

        return {
            ...omit(properties, ["sortItems"]),
            ...(sortItems ? { sortItems } : {}),
        };
    },
);

/**
 * Creates insight for execution
 * Differs from insight for create/save !!!
 * It uses custom or default sorting from sortable charts
 *  X
 * Save uses only custom sort if defined
 */
export const getInsightWithBucketsViaMd = createSelector(
    currentReportMDObjectExtended,
    getVisualizationClassRaw,
    getInsightProperties,
    openReportIdSelector,
    getReportTitle,
    getReportTags,
    getReportSummary,
    getAppliedSort,
    getSortConfig,
    canApplyCustomSort,
    getStoredLayers,
    (
        mdObject,
        visClassRaw,
        convertedProperties,
        openReportId,
        title,
        tags,
        summary,
        appliedSort,
        sortConfig,
        applySort,
        layers,
    ): IInsightDefinition => {
        // A state with NO selected visualization class must never produce an insight definition:
        // `visClassUrl` four lines on invariants on the class anyway, and a fallback here would put
        // a class-less insight on the postMessage wire. Named precondition rather than a TypeError
        // further down.
        invariant(
            visClassRaw,
            "getInsightWithBucketsViaMd requires a selected visualization class — " +
                "it must not be read on a state without a rendered visualization",
        );
        const visClass = visClassRaw;

        const insight = BackendToBearConvertors.convertVisualization(
            {
                visualizationObject: {
                    content: mdObject,
                    meta: {
                        title,
                        tags,
                        summary,
                        identifier: openReportId,
                    } as IObjectMeta, // the other meta properties are irrelevant here
                },
            },
            visClassUrl(visClass),
        );

        // insight has explicit sorts prop which affects execution
        const sortProp = applySort
            ? appliedSort.length
                ? { sorts: appliedSort }
                : { sorts: sortConfig.defaultSort } // only execution considers defaultSort
            : {};
        // but properties contain duplicated sortItems too, sync them
        let properties = convertedProperties;
        if (sortProp.sorts) {
            properties = {
                ...convertedProperties,
                sortItems: sortProp.sorts,
            };
        }

        // Include layers for multi-layer geo visualizations
        const layersProp = layers.length > 0 ? { layers } : {};

        return {
            insight: {
                ...insight.insight,
                ...sortProp,
                ...layersProp,
                properties,
            },
        };
    },
);

export const getInsightForCreateViaMd = createSelector(
    currentReportMDObjectExtended,
    getVisualizationClassRaw,
    getReportTitle,
    getReportTags,
    getReportSummary,
    getInsightProperties,
    isReportLockedSelector,
    getStoredLayers,
    (mdObject, visClassRaw, title, tags, summary, convertedProperties, locked, layers) => {
        // same named precondition as getInsightWithBucketsViaMd above (the 4.5→4.8 boundary
        // decision) — the throw semantics are deliberate, the message is the improvement
        invariant(
            visClassRaw,
            "getInsightForCreateViaMd requires a selected visualization class — " +
                "it must not be read on a state without a rendered visualization",
        );
        const visClass = visClassRaw;

        const insight = BackendToBearConvertors.convertVisualization(
            {
                visualizationObject: {
                    content: mdObject,
                    meta: {
                        title,
                        tags,
                        summary,
                        locked,
                    } as IObjectMeta, // the other meta properties are irrelevant here
                },
            },
            visClassUrl(visClass),
        );

        const sanitizedInsight = insightSanitize(insight);
        const properties = insightProperties(sanitizedInsight);

        const insightProps = {
            ...(properties ?? undefined),
            ...(convertedProperties.sortItems?.length > 0
                ? { sortItems: convertedProperties.sortItems }
                : {}),
        };

        const insightWithProperties = insightSetProperties(sanitizedInsight, insightProps);

        // Include layers for multi-layer geo visualizations
        return layers.length > 0
            ? insightSetLayers(insightWithProperties, layers)
            : (insightWithProperties as IInsightDefinition);
    },
);

export const getInsightForSaveViaMd = createSelector(
    getInsightForCreateViaMd,
    getLastSavedReportIdentifier,
    getLastSavedReportUri,
    getLastSavedReportIsHidden,
    (insightDefinition, identifier, uri, isHidden) => {
        // set identifiers from last saved
        const result: IInsight = {
            insight: {
                ...insightDefinition.insight,
                identifier,
                uri,
                ref: uriRef(uri),
                ...(isHidden !== undefined && { isHidden }),
            },
        };

        return result;
    },
);

function getDecoratedItemByLocalId(
    decoratedBuckets: IDecoratedBuckets,
    localIdentifier: string,
): IDecoratedBucketItem | undefined {
    let decoratedItem: IDecoratedBucketItem | undefined;

    decoratedBuckets.forEach((bucket: IDecoratedBucket) => {
        bucket.items.forEach((item: IDecoratedBucketItem) => {
            if (!decoratedItem && item.localIdentifier === localIdentifier) {
                decoratedItem = item;
            }
        });
    });

    return decoratedItem;
}

function getDisplayForms(decoratedItem: IDecoratedBucketItem | undefined): readonly ICacheItemDisplayForm[] {
    return decoratedItem?.attribute?.displayForms ?? [];
}

function getDisplayFormRef(decoratedItem: IDecoratedBucketItem | undefined): ObjRef | undefined {
    return decoratedItem?.attribute?.dfRef;
}

function getDisplayFormType(displayForm: ICacheItemDisplayForm | undefined): string | undefined {
    return displayForm?.type ?? displayForm?.displayFormType;
}

function getDecoratedItemByDisplayFormRef(
    decoratedBuckets: IDecoratedBuckets,
    displayFormRef: ObjRef,
): IDecoratedBucketItem | undefined {
    let decoratedItem: IDecoratedBucketItem | undefined;

    decoratedBuckets.forEach((bucket: IDecoratedBucket) => {
        bucket.items.forEach((item: IDecoratedBucketItem) => {
            const itemDisplayFormRef = getDisplayFormRef(item);
            const itemDisplayForms = getDisplayForms(item);
            const matchesSelectedDisplayForm = areObjRefsEqual(itemDisplayFormRef, displayFormRef);
            const matchesAnyAttributeDisplayForm = itemDisplayForms.some((displayForm) =>
                areObjRefsEqual(displayForm.ref, displayFormRef),
            );

            if (!decoratedItem && (matchesSelectedDisplayForm || matchesAnyAttributeDisplayForm)) {
                decoratedItem = item;
            }
        });
    });

    return decoratedItem;
}

function resolveDefaultDisplayFormRefByLocalId(decoratedBuckets: IDecoratedBuckets, localIdentifier: string) {
    const decoratedItem = getDecoratedItemByLocalId(decoratedBuckets, localIdentifier);
    const displayForms = getDisplayForms(decoratedItem);
    const defaultDisplayForm =
        displayForms.find((displayForm) => displayForm.isDefault) ??
        displayForms.find((displayForm) => displayForm.isPrimary) ??
        displayForms[0];

    return defaultDisplayForm?.ref;
}

function resolveAttributeTitleFromDecoratedItem(
    decoratedItem: IDecoratedBucketItem | undefined,
): string | undefined {
    const displayFormRef = getDisplayFormRef(decoratedItem);
    const displayForms = getDisplayForms(decoratedItem);
    const displayForm = displayForms.find((df) => areObjRefsEqual(df.ref, displayFormRef));
    // For geo display forms, use the default display form's title instead
    // of the geo-specific title (e.g. "Latitude", "Area Label")
    let resolvedTitle = displayForm?.title;
    const displayFormType = getDisplayFormType(displayForm);
    if (typeof displayFormType === "string" && displayFormType.startsWith("GDC.geo.")) {
        const defaultDF =
            displayForms.find((df) => df.isDefault) ??
            displayForms.find((df) => df.isPrimary) ??
            displayForms[0];
        if (defaultDF) {
            resolvedTitle = defaultDF.title;
        }
    }
    // try the alias first, in case the user has renamed the attribute,
    // then try the resolved title of the display form
    return decoratedItem?.alias || resolvedTitle;
}

function addMissingDisplayFormOverridesFromInsight(
    customOverrides: Record<string, IRawExportCustomOverride>,
    insight: IInsightDefinition,
    decoratedBuckets: IDecoratedBuckets,
): void {
    insightBuckets(insight).forEach((bucket) => {
        bucket.items.forEach((item) => {
            if (!isAttribute(item)) {
                return;
            }

            const localIdentifier = attributeLocalId(item);
            if (customOverrides[localIdentifier]) {
                return;
            }

            const insightAlias = attributeAlias(item);
            if (insightAlias) {
                safeSetTitle(customOverrides, localIdentifier, insightAlias);
                return;
            }

            const decoratedItem = getDecoratedItemByDisplayFormRef(
                decoratedBuckets,
                attributeDisplayFormRef(item),
            );
            const decoratedTitle = resolveAttributeTitleFromDecoratedItem(decoratedItem);
            safeSetTitle(customOverrides, localIdentifier, decoratedTitle);
        });
    });
}

function normalizeGeoInsightForRawExport(
    insight: IInsightDefinition,
    decoratedBuckets: IDecoratedBuckets,
    settings: {
        enableGeoArea: boolean;
        enableNewGeoPushpin: boolean;
    },
): IInsightDefinition {
    const type = insightVisualizationType(insight);
    const isNewGeoPushpin = type === VisualizationTypes.PUSHPIN && settings.enableNewGeoPushpin;
    const isNewGeoArea = type === VisualizationTypes.CHOROPLETH && settings.enableGeoArea;

    if (!isNewGeoPushpin && !isNewGeoArea) {
        return insight;
    }

    return normalizeGeoInsightForRawExportBase(insight, {
        resolveDefaultDisplayFormRef: (displayFormRef: ObjRef) => {
            const decoratedItem = getDecoratedItemByDisplayFormRef(decoratedBuckets, displayFormRef);

            if (!decoratedItem) {
                return undefined;
            }

            return resolveDefaultDisplayFormRefByLocalId(decoratedBuckets, decoratedItem.localIdentifier);
        },
    });
}

export const getInsightForRawExport = createSelector(
    getInsightWithBucketsViaMd,
    getDecoratedBucketsExtended,
    enableGeoArea,
    enableNewGeoPushpin,
    (insight, decoratedBuckets, isGeoAreaEnabled, isNewGeoPushpinEnabled): IInsightDefinition =>
        normalizeGeoInsightForRawExport(insight, decoratedBuckets, {
            enableGeoArea: isGeoAreaEnabled,
            enableNewGeoPushpin: isNewGeoPushpinEnabled,
        }),
);

/**
 * Selects raw export custom overrides for insight by ref.
 * This is to ensure that the raw export columns have the correct titles: same titles as in the UI.
 */
export const getRawExportOverrides = createSelector(
    getInsightForRawExport,
    getDecoratedBucketsExtended,
    (insight, buckets): IRawExportCustomOverrides => {
        const measureOverrides: Record<string, IRawExportCustomOverride> = {};
        const displayFormOverrides: Record<string, IRawExportCustomOverride> = {};

        buckets.forEach((bucket: IDecoratedBucket) => {
            bucket.items.forEach((item: IDecoratedBucketItem) => {
                const localIdentifier = item.localIdentifier;
                if (item.isMeasure) {
                    // try the alias first, in case the user has renamed the measure,
                    // then try the title of the measure itself
                    const title = item.alias || item.measureTitle;
                    safeSetTitle(measureOverrides, localIdentifier, title);
                } else if (item.isDate) {
                    // try the alias first, in case the user has renamed the date,
                    // then try the title of the granularity itself
                    const title = item.alias || item.granularity?.title;
                    safeSetTitle(displayFormOverrides, localIdentifier, title);
                } else {
                    const title = resolveAttributeTitleFromDecoratedItem(item);
                    safeSetTitle(displayFormOverrides, localIdentifier, title);
                }
            });
        });

        addMissingDisplayFormOverridesFromInsight(displayFormOverrides, insight, buckets);

        return {
            measures: measureOverrides,
            displayForms: displayFormOverrides,
        };
    },
);

/**
 * Safely sets the title in the custom overrides.
 *
 * This it to ensure that we don't override the title with an empty string which would
 * lead to HTTP 400 errors.
 *
 * @param customOverrides - the custom overrides to set the title in
 * @param localIdentifier - the local identifier of the item to set the title for
 * @param title - the title to set
 */
function safeSetTitle(
    customOverrides: Record<string, IRawExportCustomOverride>,
    localIdentifier: string,
    title: string | undefined,
) {
    if (title) {
        customOverrides[localIdentifier] = {
            title,
        };
    }
}
