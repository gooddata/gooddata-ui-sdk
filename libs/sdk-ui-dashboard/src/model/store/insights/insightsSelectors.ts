// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { IRawExportCustomOverride, IRawExportCustomOverrides } from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    IInsightWidget,
    ObjRef,
    areObjRefsEqual,
    attributeAlias,
    attributeDisplayFormRef,
    attributeLocalId,
    insightAttributes,
    insightMeasures,
    insightRef,
    measureAlias,
    measureItem,
    measureLocalId,
    measureTitle,
} from "@gooddata/sdk-model";

import { insightsAdapter } from "./insightsEntityAdapter.js";
import { ObjRefMap, newInsightMap } from "../../../_staging/metadata/objRefMap.js";
import { createMemoizedSelector } from "../_infra/selectors.js";
import { selectBackendCapabilities } from "../backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectCatalogAttributeDisplayForms,
    selectCatalogDateDatasets,
    selectCatalogMeasures,
} from "../catalog/catalogSelectors.js";
import { selectLocale } from "../config/configSelectors.js";
import { selectWidgetByRef } from "../tabs/layout/layoutSelectors.js";
import { DashboardSelector, DashboardState } from "../types.js";

const entitySelectors = insightsAdapter.getSelectors((state: DashboardState) => state.insights);

/**
 * Selects all insights used on the dashboard.
 *
 * @remarks
 * Note: if you are aiming to lookup insights using an ObjRef, then you should instead use the map returned
 * by {@link selectInsightsMap}. If you are aiming to lookup a single insight by its ref, use {@link selectInsightByRef}.
 * Using these selectors is both faster and safer as they take ObjRef type into account and look up the insight
 * depending on the type of the ref.
 *
 * See {@link selectInsightsMap} or {@link selectInsightByRef} for a faster and safer ways to get
 * an insight by its ObjRef.
 * @public
 */
export const selectInsights = entitySelectors.selectAll;

/**
 * Selects refs of all insights used on the dashboard.
 *
 * @alpha
 */
export const selectInsightRefs: DashboardSelector<ObjRef[]> = createSelector(selectInsights, (insights) => {
    return insights.map(insightRef);
});

/**
 * Selects all insights and returns them in a mapping of obj ref to the insight object.
 *
 * @alpha
 */
export const selectInsightsMap: DashboardSelector<ObjRefMap<IInsight>> = createSelector(
    selectInsights,
    selectBackendCapabilities,
    (insights, capabilities) => {
        return newInsightMap(insights, capabilities.hasTypeScopedIdentifiers);
    },
);

/**
 * Selects insight used on a dashboard by its ref.
 *
 * @alpha
 */
export const selectInsightByRef: (ref: ObjRef | undefined) => DashboardSelector<IInsight | undefined> =
    createMemoizedSelector((ref: ObjRef | undefined) => {
        return createSelector(selectInsightsMap, (insights) => {
            return ref && insights.get(ref);
        });
    });

/**
 * Selects insight used on a dashboard by widget ref.
 *
 * @alpha
 */
export const selectInsightByWidgetRef: (ref: ObjRef | undefined) => DashboardSelector<IInsight | undefined> =
    createMemoizedSelector((ref: ObjRef | undefined) => {
        return createSelector(selectWidgetByRef(ref), selectInsightsMap, (widget, insights) => {
            const ref = (widget as IInsightWidget)?.insight;
            return ref && insights.get(ref);
        });
    });

/**
 * Selects raw export custom measure overrides for insight by ref.
 *
 * @privateRemarks
 * For a given insight (identified by its ref), this selector will return a mapping of measure localId to
 * the custom title that should be used when raw exporting the insight.
 * The order of precedence is:
 * 1. If the measure has an alias in the insight definition, use that.
 * 2. If the measure has a title in the insight definition, use that.
 * 3. Use the title of the measure from the catalog.
 *
 * @alpha
 * @deprecated This selector does not fill in missing titles for derived and arithmetic measures.
 */
const selectRawExportMeasureOverridesForInsightByRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<IRawExportCustomOverrides["measures"] | undefined> = createMemoizedSelector(
    (ref: ObjRef | undefined) => {
        return createSelector(
            selectInsightByRef(ref),
            selectCatalogMeasures,
            selectLocale,
            (insight, catalogMeasures, _locale) => {
                if (!insight) {
                    return undefined;
                }

                return insightMeasures(insight).reduce(
                    (overrides, measure) => {
                        const localId = measureLocalId(measure);

                        // first, try getting the title from the insight itself,
                        // giving precedence to the alias over the title.
                        // this should also cover the case of derived measures without renames,
                        // because they have been processed by fillMissingTitles
                        const titleFromInsightMeasure = measureAlias(measure) || measureTitle(measure);
                        if (titleFromInsightMeasure) {
                            overrides[localId] = {
                                title: titleFromInsightMeasure,
                            };
                            return overrides;
                        }

                        // otherwise, get it from the catalog.
                        // we only need to look at the measures, any fact-based measures should have the title set in the
                        // insight itself
                        const catalogMeasure = catalogMeasures.find((m) =>
                            areObjRefsEqual(m.measure.ref, measureItem(measure)),
                        );
                        if (catalogMeasure) {
                            overrides[localId] = {
                                title: catalogMeasure.measure.title,
                            };
                        }

                        return overrides;
                    },
                    {} as Record<string, IRawExportCustomOverride>,
                );
            },
        );
    },
);

/**
 * Selects raw export custom measure overrides for insight.
 *
 * @privateRemarks
 * For a given insight, this selector will return a mapping of measure localId to
 * the custom title that should be used when raw exporting the insight.
 * The order of precedence is:
 * 1. If the measure has an alias in the insight definition, use that.
 * 2. If the measure has a title in the insight definition, use that.
 * 3. Use the title of the measure from the catalog.
 *
 * @alpha
 */
const selectRawExportMeasureOverridesForInsight: (
    insight: IInsight | undefined,
) => DashboardSelector<IRawExportCustomOverrides["measures"] | undefined> = createMemoizedSelector(
    (insight: IInsight | undefined) => {
        return createSelector(selectCatalogMeasures, (catalogMeasures) => {
            if (!insight) {
                return undefined;
            }

            // the insight needs to have missing titles for derived and arithmetic measures already filled
            return insightMeasures(insight).reduce(
                (overrides, measure) => {
                    const localId = measureLocalId(measure);

                    // first, try getting the title from the insight itself,
                    // giving precedence to the alias over the title.
                    // this should also cover the case of derived measures without renames,
                    // because they have been processed by fillMissingTitles
                    const titleFromInsightMeasure = measureAlias(measure) || measureTitle(measure);
                    if (titleFromInsightMeasure) {
                        overrides[localId] = {
                            title: titleFromInsightMeasure,
                        };
                        return overrides;
                    }

                    // otherwise, get it from the catalog.
                    // we only need to look at the measures, any fact-based measures should have the title set in the
                    // insight itself
                    const catalogMeasure = catalogMeasures.find((m) =>
                        areObjRefsEqual(m.measure.ref, measureItem(measure)),
                    );
                    if (catalogMeasure) {
                        overrides[localId] = {
                            title: catalogMeasure.measure.title,
                        };
                    }

                    return overrides;
                },
                {} as Record<string, IRawExportCustomOverride>,
            );
        });
    },
);

/**
 * Selects raw export custom display form overrides for insight by ref.
 *
 * @privateRemarks
 * For a given insight (identified by its ref), this selector will return a mapping of attribute localId to
 * the custom title that should be used when raw exporting the insight.
 * The order of precedence is:
 * 1. If the attribute has an alias in the insight definition, use that.
 * 2. Use the title of the attribute from the catalog, trying normal attributes first and then date datasets.
 *
 * @alpha
 */
const selectRawExportDisplayFormOverridesForInsight: (
    insight: IInsight | undefined,
) => DashboardSelector<IRawExportCustomOverrides["displayForms"] | undefined> = createMemoizedSelector(
    (insight: IInsight | undefined) => {
        return createSelector(
            selectCatalogAttributeDisplayForms,
            selectCatalogDateDatasets,
            (catalogAttributeDisplayForms, catalogDateDatasets) => {
                if (!insight) {
                    return undefined;
                }

                return insightAttributes(insight).reduce(
                    (overrides, attribute) => {
                        const localId = attributeLocalId(attribute);

                        // first, try getting the title from the insight itself
                        const titleFromInsightAttribute = attributeAlias(attribute);
                        if (titleFromInsightAttribute) {
                            overrides[localId] = {
                                title: titleFromInsightAttribute,
                            };
                            return overrides;
                        }

                        // otherwise, get it from the catalog.
                        // first try the attributes
                        const catalogDisplayForm = catalogAttributeDisplayForms.find((a) =>
                            areObjRefsEqual(a.ref, attributeDisplayFormRef(attribute)),
                        );
                        if (catalogDisplayForm) {
                            overrides[localId] = {
                                title: catalogDisplayForm.title,
                            };
                            return overrides;
                        }

                        // then try the date datasets
                        catalogDateDatasets.forEach((dateDataset) => {
                            const catalogDateAttribute = dateDataset.dateAttributes.find((a) =>
                                areObjRefsEqual(a.defaultDisplayForm.ref, attributeDisplayFormRef(attribute)),
                            );
                            if (catalogDateAttribute) {
                                overrides[localId] = {
                                    title: catalogDateAttribute.defaultDisplayForm.title,
                                };
                            }
                        });

                        return overrides;
                    },
                    {} as Record<string, IRawExportCustomOverride>,
                );
            },
        );
    },
);
/**
 * Selects raw export custom display form overrides for insight by ref.
 *
 * @privateRemarks
 * For a given insight (identified by its ref), this selector will return a mapping of attribute localId to
 * the custom title that should be used when raw exporting the insight.
 * The order of precedence is:
 * 1. If the attribute has an alias in the insight definition, use that.
 * 2. Use the title of the attribute from the catalog, trying normal attributes first and then date datasets.
 *
 * @alpha
 */
const selectRawExportDisplayFormOverridesForInsightByRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<IRawExportCustomOverrides["displayForms"] | undefined> = createMemoizedSelector(
    (ref: ObjRef | undefined) => {
        return createSelector(
            selectInsightByRef(ref),
            selectCatalogAttributeDisplayForms,
            selectCatalogDateDatasets,
            (insight, catalogAttributeDisplayForms, catalogDateDatasets) => {
                if (!insight) {
                    return undefined;
                }

                return insightAttributes(insight).reduce(
                    (overrides, attribute) => {
                        const localId = attributeLocalId(attribute);

                        // first, try getting the title from the insight itself
                        const titleFromInsightAttribute = attributeAlias(attribute);
                        if (titleFromInsightAttribute) {
                            overrides[localId] = {
                                title: titleFromInsightAttribute,
                            };
                            return overrides;
                        }

                        // otherwise, get it from the catalog.
                        // first try the attributes
                        const catalogDisplayForm = catalogAttributeDisplayForms.find((a) =>
                            areObjRefsEqual(a.ref, attributeDisplayFormRef(attribute)),
                        );
                        if (catalogDisplayForm) {
                            overrides[localId] = {
                                title: catalogDisplayForm.title,
                            };
                            return overrides;
                        }

                        // then try the date datasets
                        catalogDateDatasets.forEach((dateDataset) => {
                            const catalogDateAttribute = dateDataset.dateAttributes.find((a) =>
                                areObjRefsEqual(a.defaultDisplayForm.ref, attributeDisplayFormRef(attribute)),
                            );
                            if (catalogDateAttribute) {
                                overrides[localId] = {
                                    title: catalogDateAttribute.defaultDisplayForm.title,
                                };
                            }
                        });

                        return overrides;
                    },
                    {} as Record<string, IRawExportCustomOverride>,
                );
            },
        );
    },
);

/**
 * Selects raw export custom overrides for insight by ref.
 *
 * @deprecated The insights reached by refs don't have missing titles for derived and arithmetic measures filled in.
 * @alpha
 */
export const selectRawExportOverridesForInsightByRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<IRawExportCustomOverrides | undefined> = createMemoizedSelector(
    (ref: ObjRef | undefined) => {
        return createSelector(
            selectRawExportMeasureOverridesForInsightByRef(ref),
            selectRawExportDisplayFormOverridesForInsightByRef(ref),
            (measureOverrides, displayFormOverrides) => {
                return {
                    measures: measureOverrides,
                    displayForms: displayFormOverrides,
                };
            },
        );
    },
);

/**
 * Selects raw export custom overrides for insight. Note that it's recommended to use
 * fillMissingTitles to fill in missing titles for derived and arithmetic measures.
 *
 * @alpha
 */
export const selectRawExportOverridesForInsight: (
    insight: IInsight | undefined,
) => DashboardSelector<IRawExportCustomOverrides | undefined> = createMemoizedSelector(
    (insight: IInsight | undefined) => {
        return createSelector(
            selectRawExportMeasureOverridesForInsight(insight),
            selectRawExportDisplayFormOverridesForInsight(insight),
            (measureOverrides, displayFormOverrides) => {
                return {
                    measures: measureOverrides,
                    displayForms: displayFormOverrides,
                };
            },
        );
    },
);
