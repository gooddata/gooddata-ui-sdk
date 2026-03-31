// (C) 2020-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { isEqual } from "lodash-es";
import { useIntl } from "react-intl";

import {
    type IDrillToDashboard,
    type IDrillToInsight,
    type InsightDrillDefinition,
    bucketsAttributes,
    insightBuckets,
    insightFilters,
    insightMeasures,
    measureFilters,
    measureLocalId,
} from "@gooddata/sdk-model";

import { mapDashboardFilterToOption } from "./optionMappings/mapDashboardFilterToOption.js";
import { mapIntersectionAttributeToOption } from "./optionMappings/mapIntersectionAttributeToOption.js";
import { mapSourceInsightFilterToOption } from "./optionMappings/mapSourceInsightFilterToOption.js";
import { mapSourceMeasureFilterToOption } from "./optionMappings/mapSourceMeasureFilterToOption.js";
import { type IDrillFiltersConfigOption } from "./types.js";
import { type IDrillFiltersConfigSelection } from "./useDrillFiltersConfigInner.js";
import { useFetchTargetDashboardFilters } from "./useFetchTargetDashboardFilters.js";
import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectCatalogDateDatasets,
    selectCatalogMeasures,
} from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectInsightByWidgetRef } from "../../../../../model/store/insights/insightsSelectors.js";
import { selectAttributeFilterConfigsOverrides } from "../../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectDateFilterConfigOverrides } from "../../../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectDateFilterConfigsOverrides } from "../../../../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import { selectFilterContextFilters } from "../../../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { selectWidgetDrills } from "../../../../../model/store/tabs/layout/layoutSelectors.js";
import {
    DRILL_TARGET_TYPE,
    type IDrillConfigItem,
    type IDrillDownAttributeHierarchyConfig,
    type IDrillDownAttributeHierarchyDefinition,
    type IDrillToDashboardConfig,
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

export function useDrillFiltersConfig({ item, onUpdateDrillItem }: IUseDrillFiltersConfigParams) {
    const intl = useIntl();
    const isDrillToDashboard = item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD;
    const supportsExtendedFiltersConfig =
        item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_INSIGHT ||
        item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD;
    const isDrillDown = item.drillTargetType === DRILL_TARGET_TYPE.DRILL_DOWN;
    const extendedDrillFiltersItem =
        isDrillToInsightConfig(item) || item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD
            ? (item as IDrillToInsightConfig | IDrillToDashboardConfig)
            : undefined;
    const insight = useDashboardSelector(selectInsightByWidgetRef(item.widgetRef));
    const widgetDrills = useDashboardSelector(selectWidgetDrills(item.widgetRef));
    const sourceDashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const sourceDashboardAttributeFilterConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const allCatalogDisplayFormsMap = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const allCatalogDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const dateFilterConfigOverride = useDashboardSelector(selectDateFilterConfigOverrides);
    const allCatalogMeasures = useDashboardSelector(selectCatalogMeasures);
    const allDateFilterConfigsOverrides = useDashboardSelector(selectDateFilterConfigsOverrides);
    const {
        targetDashboardFilters,
        targetDashboardAttributeFilters,
        targetDashboardAttributeFilterConfigs,
        isLoading,
    } = useFetchTargetDashboardFilters(item);

    const sourceInsightAttributes = useMemo(
        () => bucketsAttributes(insight ? insightBuckets(insight) : []),
        [insight],
    );
    const sourceInsightMeasures = useMemo(() => (insight ? insightMeasures(insight) : []), [insight]);
    const allCatalogDateAttributeDisplayForms = useMemo(
        () =>
            allCatalogDateDatasets.flatMap((ds) => ds.dateAttributes).flatMap((da) => da.defaultDisplayForm),
        [allCatalogDateDatasets],
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
                    allCatalogDisplayFormsMap,
                    allCatalogDateAttributeDisplayForms,
                    targetDashboardAttributeFilters,
                    isDrillToDashboard,
                    intl,
                }),
            ),
        [
            sourceInsightAttributes,
            allCatalogDisplayFormsMap,
            allCatalogDateAttributeDisplayForms,
            targetDashboardAttributeFilters,
            isDrillToDashboard,
            intl,
        ],
    );

    const sourceInsightFiltersOptions = useMemo(() => {
        if (!(supportsExtendedFiltersConfig || isDrillDown) || !insight) {
            return [];
        }

        return insightFilters(insight)
            .map((sourceInsightFilter) =>
                mapSourceInsightFilterToOption({
                    sourceInsightFilter,
                    allCatalogDisplayFormsMap,
                    allCatalogDateDatasets,
                    sourceInsightMeasures,
                    allCatalogMeasures,
                    targetDashboardFilters,
                    targetDashboardAttributeFilters,
                    isDrillDown,
                    isDrillToDashboard,
                    intl,
                }),
            )
            .filter((option): option is IDrillFiltersConfigOption => !!option);
    }, [
        supportsExtendedFiltersConfig,
        insight,
        allCatalogDisplayFormsMap,
        allCatalogDateDatasets,
        sourceInsightMeasures,
        allCatalogMeasures,
        targetDashboardFilters,
        targetDashboardAttributeFilters,
        isDrillDown,
        isDrillToDashboard,
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
                    allCatalogDisplayFormsMap,
                    allCatalogDateDatasets,
                    targetDashboardFilters,
                    targetDashboardAttributeFilters,
                    isDrillToDashboard,
                    intl,
                }),
            )
            .filter((option): option is IDrillFiltersConfigOption => !!option);
    }, [
        supportsExtendedFiltersConfig,
        insight,
        sourceMeasure,
        allCatalogDisplayFormsMap,
        allCatalogDateDatasets,
        targetDashboardFilters,
        targetDashboardAttributeFilters,
        isDrillToDashboard,
        intl,
    ]);
    const dashboardFiltersOptions = useMemo(() => {
        if (!(supportsExtendedFiltersConfig || isDrillDown)) {
            return [];
        }

        return sourceDashboardFilters
            .map((dashboardFilter) =>
                mapDashboardFilterToOption({
                    dashboardFilter,
                    allCatalogDisplayFormsMap,
                    allCatalogDateDatasets,
                    dateFilterConfigOverride,
                    allDateFilterConfigsOverrides,
                    sourceDashboardAttributeFilterConfigs,
                    targetDashboardFilters,
                    targetDashboardAttributeFilters,
                    targetDashboardAttributeFilterConfigs,
                    isDrillDown,
                    isDrillToDashboard,
                    intl,
                }),
            )
            .filter((option): option is IDrillFiltersConfigOption => !!option);
    }, [
        supportsExtendedFiltersConfig,
        isDrillDown,
        sourceDashboardFilters,
        allCatalogDisplayFormsMap,
        allCatalogDateDatasets,
        dateFilterConfigOverride,
        allDateFilterConfigsOverrides,
        sourceDashboardAttributeFilterConfigs,
        targetDashboardFilters,
        targetDashboardAttributeFilters,
        targetDashboardAttributeFilterConfigs,
        isDrillToDashboard,
        intl,
    ]);

    const currentSelection = useMemo<IDrillFiltersConfigSelection>(
        () => ({
            drillIntersectionIgnoredAttributes: item.drillIntersectionIgnoredAttributes ?? [],
            includedSourceInsightFiltersObjRefs:
                extendedDrillFiltersItem?.includedSourceInsightFiltersObjRefs ?? [],
            ignoredDashboardFilters: extendedDrillFiltersItem?.ignoredDashboardFilters ?? [],
            includedSourceMeasureFiltersObjRefs:
                extendedDrillFiltersItem?.includedSourceMeasureFiltersObjRefs ?? [],
        }),
        [
            item.drillIntersectionIgnoredAttributes,
            extendedDrillFiltersItem?.includedSourceInsightFiltersObjRefs,
            extendedDrillFiltersItem?.ignoredDashboardFilters,
            extendedDrillFiltersItem?.includedSourceMeasureFiltersObjRefs,
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
                        } as IDrillToInsight | IDrillToDashboard,
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
        [currentSelection, widgetDrills, item, isDrillDown, supportsExtendedFiltersConfig, onUpdateDrillItem],
    );

    return {
        isLoading,
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
