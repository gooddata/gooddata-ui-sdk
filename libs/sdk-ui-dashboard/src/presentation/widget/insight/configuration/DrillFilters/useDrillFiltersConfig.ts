// (C) 2020-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { isEqual } from "lodash-es";
import { type IntlShape, defineMessages, useIntl } from "react-intl";

import {
    type FilterContextItem,
    type IDashboardDateFilterConfigItem,
    type IDrillToDashboard,
    type IDrillToInsight,
    type IFilter,
    type IMeasure,
    type InsightDrillDefinition,
    type ObjRef,
    type SourceMeasureFilterObjRef,
    bucketsAttributes,
    insightBuckets,
    insightFilters,
    insightMeasures,
    isDashboardAttributeFilter,
    isDashboardDateFilterWithDimension,
    isRankingFilter,
    measureFilters,
    measureLocalId,
} from "@gooddata/sdk-model";

import {
    getDashboardDateFilterCustomTitle,
    getDateDatasetTitle,
    getDisplayFormTitle,
    getMeasureTitleFromSourceInsightMeasures,
    sourceFilterOptionId,
} from "./drillFiltersConfigUtils.js";
import { type IDrillFiltersConfigOption } from "./types.js";
import { type IDrillFiltersConfigSelection } from "./useDrillFiltersConfigInner.js";
import { sourceInsightFilterObjRef as getSourceInsightFilterObjRef } from "../../../../../_staging/drills/drillingUtils.js";
import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import {
    selectCatalogAttributeDisplayForms,
    selectCatalogDateDatasets,
} from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectInsightByWidgetRef } from "../../../../../model/store/insights/insightsSelectors.js";
import { selectDateFilterConfigsOverrides } from "../../../../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import { selectFilterContextDraggableFilters } from "../../../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { selectWidgetDrills } from "../../../../../model/store/tabs/layout/layoutSelectors.js";
import {
    DRILL_TARGET_TYPE,
    type IDrillConfigItem,
    type IDrillDownAttributeHierarchyConfig,
    type IDrillDownAttributeHierarchyDefinition,
    type IDrillToInsightConfig,
    isDrillToInsightConfig,
} from "../../../../drill/types.js";

interface IUseDrillFiltersConfigParams {
    item: IDrillConfigItem;
    onUpdateDrillItem: (
        drill: InsightDrillDefinition | IDrillDownAttributeHierarchyDefinition,
        changedItem: IDrillConfigItem,
    ) => void;
}

const messages = defineMessages({
    rankingFilterPreviewTopWithoutAttributePlain: {
        id: "rankingFilter.preview.top_without_attribute_plain",
    },
    rankingFilterPreviewBottomWithoutAttributePlain: {
        id: "rankingFilter.preview.bottom_without_attribute_plain",
    },
});

function mapIntersectionAttributeToOption({
    insightAttribute,
    allCatalogDisplayForms,
    allCatalogDateAttributeDisplayForms,
}: {
    insightAttribute: ReturnType<typeof bucketsAttributes>[number];
    allCatalogDisplayForms: Array<{ ref: ObjRef; title?: string }>;
    allCatalogDateAttributeDisplayForms: Array<{ ref: ObjRef; title?: string }>;
}): IDrillFiltersConfigOption {
    return {
        id: insightAttribute.attribute.localIdentifier,
        title: getDisplayFormTitle({
            displayFormRef: insightAttribute.attribute.displayForm,
            allCatalogDisplayForms,
            allCatalogDateAttributeDisplayForms,
        }),
    };
}

function mapDashboardFilterToOption({
    dashboardFilter,
    allCatalogDisplayForms,
    allCatalogDateAttributeDisplayForms,
    allDateDatasets,
    allDateFilterConfigsOverrides,
}: {
    dashboardFilter: FilterContextItem;
    allCatalogDisplayForms: Array<{ ref: ObjRef; title?: string }>;
    allCatalogDateAttributeDisplayForms: Array<{ ref: ObjRef; title?: string }>;
    allDateDatasets: Array<{ dataSet: { ref: ObjRef; title?: string } }>;
    allDateFilterConfigsOverrides: IDashboardDateFilterConfigItem[];
}): IDrillFiltersConfigOption | undefined {
    if (isDashboardAttributeFilter(dashboardFilter)) {
        const displayFormRef = dashboardFilter.attributeFilter.displayForm;
        const localIdentifier = dashboardFilter.attributeFilter.localIdentifier;
        const customTitle = dashboardFilter.attributeFilter.title;

        if (!localIdentifier) {
            return undefined;
        }

        return {
            id: localIdentifier,
            title:
                customTitle ??
                getDisplayFormTitle({
                    displayFormRef,
                    allCatalogDisplayForms,
                    allCatalogDateAttributeDisplayForms,
                }),
        };
    }

    if (isDashboardDateFilterWithDimension(dashboardFilter)) {
        const datasetRef = dashboardFilter.dateFilter.dataSet;
        const localIdentifier = dashboardFilter.dateFilter.localIdentifier;

        if (!localIdentifier || !datasetRef) {
            return undefined;
        }
        const customTitle = getDashboardDateFilterCustomTitle({
            datasetRef,
            allDateFilterConfigsOverrides,
        });

        return {
            id: localIdentifier,
            title:
                customTitle ??
                getDateDatasetTitle({
                    datasetRef,
                    allDateDatasets,
                }),
        };
    }

    return undefined;
}

function mapSourceInsightFilterToOption({
    sourceInsightFilter,
    allCatalogDisplayForms,
    allDateDatasets,
    sourceInsightMeasures,
    intl,
}: {
    sourceInsightFilter: IFilter;
    allCatalogDisplayForms: Array<{ ref: ObjRef; title?: string }>;
    allDateDatasets: Array<{ dataSet: { ref: ObjRef; title?: string } }>;
    sourceInsightMeasures: IMeasure[];
    intl: IntlShape;
}): IDrillFiltersConfigOption | undefined {
    const sourceFilterObjRef = getSourceInsightFilterObjRef(sourceInsightFilter);
    if (!sourceFilterObjRef) {
        return undefined;
    }

    if (sourceFilterObjRef.type === "attributeFilter") {
        const displayFormRef = sourceFilterObjRef.label;

        return {
            id: sourceFilterOptionId(sourceFilterObjRef),
            title: getDisplayFormTitle({
                displayFormRef,
                allCatalogDisplayForms,
            }),
            sourceInsightFilterObjRef: sourceFilterObjRef,
        };
    }

    if (sourceFilterObjRef.type === "dateFilter") {
        const dateDatasetRef = sourceFilterObjRef.dataSet;

        return {
            id: sourceFilterOptionId(sourceFilterObjRef),
            title: getDateDatasetTitle({
                datasetRef: dateDatasetRef,
                allDateDatasets,
            }),
            sourceInsightFilterObjRef: sourceFilterObjRef,
        };
    }

    if (sourceFilterObjRef.type === "measureValueFilter") {
        const measureRef = sourceFilterObjRef.measure;
        const measureTitleFromInsight = getMeasureTitleFromSourceInsightMeasures(
            sourceInsightMeasures,
            measureRef,
        );

        return {
            id: sourceFilterOptionId(sourceFilterObjRef),
            title: measureTitleFromInsight ?? "",
            sourceInsightFilterObjRef: sourceFilterObjRef,
        };
    }

    if (sourceFilterObjRef.type === "rankingFilter" && isRankingFilter(sourceInsightFilter)) {
        const measureRef = sourceFilterObjRef.measure;
        const measureTitleFromInsight = getMeasureTitleFromSourceInsightMeasures(
            sourceInsightMeasures,
            measureRef,
        );
        const rankingPreviewMessage =
            sourceInsightFilter.rankingFilter.operator === "TOP"
                ? messages.rankingFilterPreviewTopWithoutAttributePlain
                : messages.rankingFilterPreviewBottomWithoutAttributePlain;

        const title = intl.formatMessage(rankingPreviewMessage, {
            value: sourceInsightFilter.rankingFilter.value,
            measure: measureTitleFromInsight ?? "",
        });
        return {
            id: sourceFilterOptionId(sourceFilterObjRef),
            title,
            sourceInsightFilterObjRef: sourceFilterObjRef,
        };
    }

    return undefined;
}

function mapSourceMeasureFilterToOption({
    sourceMeasureFilter,
    allCatalogDisplayForms,
    allDateDatasets,
}: {
    sourceMeasureFilter: IFilter;
    allCatalogDisplayForms: Array<{ ref: ObjRef; title?: string }>;
    allDateDatasets: Array<{ dataSet: { ref: ObjRef; title?: string } }>;
}): IDrillFiltersConfigOption | undefined {
    const sourceFilterObjRef = getSourceInsightFilterObjRef(sourceMeasureFilter);
    if (!sourceFilterObjRef) {
        return undefined;
    }

    if (sourceFilterObjRef.type === "attributeFilter") {
        const displayFormRef = sourceFilterObjRef.label;

        return {
            id: sourceFilterOptionId(sourceFilterObjRef),
            title: getDisplayFormTitle({
                displayFormRef,
                allCatalogDisplayForms,
            }),
            sourceMeasureFilterObjRef: sourceFilterObjRef as SourceMeasureFilterObjRef,
        };
    }

    if (sourceFilterObjRef.type === "dateFilter") {
        const dateDatasetRef = sourceFilterObjRef.dataSet;

        return {
            id: sourceFilterOptionId(sourceFilterObjRef),
            title: getDateDatasetTitle({
                datasetRef: dateDatasetRef,
                allDateDatasets,
            }),
            sourceMeasureFilterObjRef: sourceFilterObjRef as SourceMeasureFilterObjRef,
        };
    }

    return undefined;
}

export function useDrillFiltersConfig({ item, onUpdateDrillItem }: IUseDrillFiltersConfigParams) {
    const intl = useIntl();
    const supportsExtendedFiltersConfig = item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_INSIGHT;
    const drillToInsightItem = isDrillToInsightConfig(item) ? (item as IDrillToInsightConfig) : undefined;
    const insight = useDashboardSelector(selectInsightByWidgetRef(item.widgetRef));
    const widgetDrills = useDashboardSelector(selectWidgetDrills(item.widgetRef));
    const dashboardFilters = useDashboardSelector(selectFilterContextDraggableFilters);
    const allCatalogDisplayForms = useDashboardSelector(selectCatalogAttributeDisplayForms);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const allDateFilterConfigsOverrides = useDashboardSelector(selectDateFilterConfigsOverrides);

    const sourceInsightAttributes = useMemo(
        () => bucketsAttributes(insight ? insightBuckets(insight) : []),
        [insight],
    );
    const sourceInsightMeasures = useMemo(() => (insight ? insightMeasures(insight) : []), [insight]);
    const allCatalogDateAttributeDisplayForms = useMemo(
        () => allDateDatasets.flatMap((ds) => ds.dateAttributes).flatMap((da) => da.defaultDisplayForm),
        [allDateDatasets],
    );
    const sourceMeasure =
        item.type === "measure"
            ? sourceInsightMeasures.find((measure) => measureLocalId(measure) === item.originLocalIdentifier)
            : undefined;

    const intersectionAttributesOptions = useMemo(
        () =>
            sourceInsightAttributes.map((insightAttribute) =>
                mapIntersectionAttributeToOption({
                    insightAttribute,
                    allCatalogDisplayForms,
                    allCatalogDateAttributeDisplayForms,
                }),
            ),
        [sourceInsightAttributes, allCatalogDisplayForms, allCatalogDateAttributeDisplayForms],
    );

    const sourceInsightFiltersOptions = useMemo(() => {
        if (!supportsExtendedFiltersConfig || !insight) {
            return [];
        }

        return insightFilters(insight)
            .map((sourceInsightFilter) =>
                mapSourceInsightFilterToOption({
                    sourceInsightFilter,
                    allCatalogDisplayForms,
                    allDateDatasets,
                    sourceInsightMeasures,
                    intl,
                }),
            )
            .filter((option): option is IDrillFiltersConfigOption => !!option);
    }, [
        supportsExtendedFiltersConfig,
        insight,
        allCatalogDisplayForms,
        allDateDatasets,
        sourceInsightMeasures,
        intl,
    ]);
    const sourceMeasureFiltersOptions = useMemo(() => {
        if (!supportsExtendedFiltersConfig || !insight || !sourceMeasure) {
            return [];
        }

        return (measureFilters(sourceMeasure) ?? [])
            .map((sourceMeasureFilter) =>
                mapSourceMeasureFilterToOption({
                    sourceMeasureFilter,
                    allCatalogDisplayForms,
                    allDateDatasets,
                }),
            )
            .filter((option): option is IDrillFiltersConfigOption => !!option);
    }, [supportsExtendedFiltersConfig, insight, sourceMeasure, allCatalogDisplayForms, allDateDatasets]);
    const dashboardFiltersOptions = useMemo(() => {
        if (!supportsExtendedFiltersConfig) {
            return [];
        }

        return dashboardFilters
            .map((dashboardFilter) =>
                mapDashboardFilterToOption({
                    dashboardFilter,
                    allCatalogDisplayForms,
                    allCatalogDateAttributeDisplayForms,
                    allDateDatasets,
                    allDateFilterConfigsOverrides,
                }),
            )
            .filter((option): option is IDrillFiltersConfigOption => !!option);
    }, [
        supportsExtendedFiltersConfig,
        dashboardFilters,
        allCatalogDisplayForms,
        allCatalogDateAttributeDisplayForms,
        allDateDatasets,
        allDateFilterConfigsOverrides,
    ]);

    const currentSelection = useMemo<IDrillFiltersConfigSelection>(
        () => ({
            drillIntersectionIgnoredAttributes: item.drillIntersectionIgnoredAttributes ?? [],
            includedSourceInsightFiltersObjRefs:
                drillToInsightItem?.includedSourceInsightFiltersObjRefs ?? [],
            ignoredDashboardFilters: drillToInsightItem?.ignoredDashboardFilters ?? [],
            includedSourceMeasureFiltersObjRefs:
                drillToInsightItem?.includedSourceMeasureFiltersObjRefs ?? [],
        }),
        [
            item.drillIntersectionIgnoredAttributes,
            drillToInsightItem?.includedSourceInsightFiltersObjRefs,
            drillToInsightItem?.ignoredDashboardFilters,
            drillToInsightItem?.includedSourceMeasureFiltersObjRefs,
        ],
    );

    const onDrillFiltersChange = useCallback(
        (selection: IDrillFiltersConfigSelection) => {
            const {
                drillIntersectionIgnoredAttributes,
                includedSourceInsightFiltersObjRefs,
                ignoredDashboardFilters,
                includedSourceMeasureFiltersObjRefs,
            } = {
                ...currentSelection,
                ...selection,
            };
            const targetDrill = widgetDrills.find((d) => d.localIdentifier === item.localIdentifier);
            const isDrillDown = item.drillTargetType === DRILL_TARGET_TYPE.DRILL_DOWN;
            const isIntersectionAttributesChanged = !isEqual(
                currentSelection.drillIntersectionIgnoredAttributes,
                drillIntersectionIgnoredAttributes,
            );
            const isSourceInsightFiltersChanged = !isEqual(
                currentSelection.includedSourceInsightFiltersObjRefs,
                includedSourceInsightFiltersObjRefs,
            );
            const isIgnoredDashboardFiltersChanged = !isEqual(
                currentSelection.ignoredDashboardFilters,
                ignoredDashboardFilters,
            );
            const isSourceMeasureFiltersChanged = !isEqual(
                currentSelection.includedSourceMeasureFiltersObjRefs,
                includedSourceMeasureFiltersObjRefs,
            );
            const isExtendedFilterSelectionChanged =
                isSourceInsightFiltersChanged ||
                isIgnoredDashboardFiltersChanged ||
                isSourceMeasureFiltersChanged;

            const isChanged =
                isIntersectionAttributesChanged ||
                (supportsExtendedFiltersConfig && isExtendedFilterSelectionChanged);

            if (isDrillDown && isChanged) {
                const drillDownItem: IDrillDownAttributeHierarchyDefinition = {
                    attributeHierarchyRef: (item as IDrillDownAttributeHierarchyConfig).attributeHierarchyRef,
                    type: "drillDownAttributeHierarchy",
                    attributes: item.attributes,
                    originLocalIdentifier: item.originLocalIdentifier,
                    drillIntersectionIgnoredAttributes: drillIntersectionIgnoredAttributes ?? [],
                };

                onUpdateDrillItem(drillDownItem, {
                    ...item,
                    drillIntersectionIgnoredAttributes: drillIntersectionIgnoredAttributes,
                } as IDrillConfigItem);
            } else if (targetDrill && isChanged) {
                if (supportsExtendedFiltersConfig) {
                    onUpdateDrillItem(
                        {
                            ...targetDrill,
                            drillIntersectionIgnoredAttributes: drillIntersectionIgnoredAttributes,
                            includedSourceInsightFiltersObjRefs,
                            ignoredDashboardFilters,
                            includedSourceMeasureFiltersObjRefs,
                        } as IDrillToInsight,
                        {
                            ...item,
                            drillIntersectionIgnoredAttributes: drillIntersectionIgnoredAttributes,
                            includedSourceInsightFiltersObjRefs,
                            ignoredDashboardFilters,
                            includedSourceMeasureFiltersObjRefs,
                        },
                    );
                } else {
                    onUpdateDrillItem(
                        {
                            ...targetDrill,
                            drillIntersectionIgnoredAttributes: drillIntersectionIgnoredAttributes,
                        } as IDrillToDashboard,
                        {
                            ...item,
                            drillIntersectionIgnoredAttributes: drillIntersectionIgnoredAttributes,
                        },
                    );
                }
            }
        },
        [currentSelection, widgetDrills, item, supportsExtendedFiltersConfig, onUpdateDrillItem],
    );

    return {
        supportsExtendedFiltersConfig,
        intersectionAttributesOptions,
        sourceInsightFiltersOptions,
        sourceMeasureFiltersOptions,
        dashboardFiltersOptions,
        drillIntersectionIgnoredAttributes: currentSelection.drillIntersectionIgnoredAttributes ?? [],
        includedSourceInsightFiltersObjRefs: currentSelection.includedSourceInsightFiltersObjRefs ?? [],
        ignoredDashboardFilters: currentSelection.ignoredDashboardFilters ?? [],
        includedSourceMeasureFiltersObjRefs: currentSelection.includedSourceMeasureFiltersObjRefs ?? [],
        onDrillFiltersChange,
    };
}
