// (C) 2020-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { isEqual } from "lodash-es";
import { useIntl } from "react-intl";

import {
    type IDrillToDashboard,
    type IDrillToInsight,
    type InsightDrillDefinition,
    type ObjRefInScope,
    areObjRefsEqual,
    bucketsAttributes,
    insightBuckets,
    insightFilters,
    insightMeasures,
    isDashboardMeasureValueFilter,
    measureFilters,
    measureLocalId,
} from "@gooddata/sdk-model";

import { isSourceInsightFilterObjRefEqual } from "../../../../../_staging/drills/drillingUtils.js";
import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectCatalogDateDatasets,
    selectCatalogMeasures,
} from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectEnableMeasureValueFilterKD } from "../../../../../model/store/config/configSelectors.js";
import {
    selectInsightByRef,
    selectInsightByWidgetRef,
} from "../../../../../model/store/insights/insightsSelectors.js";
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
import { useMeasureValueFilterCompatibility } from "../../../common/configuration/useMeasureValueFilterCompatibility.js";

import { messages } from "./messages.js";
import { mapDashboardFilterToOption } from "./optionMappings/mapDashboardFilterToOption.js";
import { mapIntersectionAttributeToOption } from "./optionMappings/mapIntersectionAttributeToOption.js";
import { mapSourceInsightFilterToOption } from "./optionMappings/mapSourceInsightFilterToOption.js";
import { mapSourceMeasureFilterToOption } from "./optionMappings/mapSourceMeasureFilterToOption.js";
import { type IDrillFiltersConfigOption, isDrillFiltersConfigOptionSelected } from "./types.js";
import { type IDrillFiltersConfigSelection } from "./useDrillFiltersConfigInner.js";
import { useFetchTargetDashboardFilters } from "./useFetchTargetDashboardFilters.js";

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
    const isDrillToInsight = item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_INSIGHT;
    const isDrillDown = item.drillTargetType === DRILL_TARGET_TYPE.DRILL_DOWN;
    const supportsExtendedFiltersConfig =
        item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_INSIGHT ||
        item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD;
    const extendedDrillFiltersItem =
        isDrillToInsightConfig(item) || item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD
            ? (item as IDrillToInsightConfig | IDrillToDashboardConfig)
            : undefined;
    const insight = useDashboardSelector(selectInsightByWidgetRef(item.widgetRef));
    const targetInsight = useDashboardSelector(
        selectInsightByRef(isDrillToInsight ? (item as IDrillToInsightConfig).insightRef : undefined),
    );
    const widgetDrills = useDashboardSelector(selectWidgetDrills(item.widgetRef));
    const enableMeasureValueFilter = useDashboardSelector(selectEnableMeasureValueFilterKD);
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
        targetDashboardTextAttributeFilters,
        targetDashboardAttributeFilterConfigs,
        targetDashboardMeasureValueFilters,
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

    const sourceDashboardMeasureValueFilters = useMemo(
        () => sourceDashboardFilters.filter(isDashboardMeasureValueFilter),
        [sourceDashboardFilters],
    );

    const { compatibleMeasureValueFilters: targetInsightCompatibleMeasureValueFilters } =
        useMeasureValueFilterCompatibility(targetInsight, sourceDashboardMeasureValueFilters);

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
                    targetDashboardTextAttributeFilters,
                    targetDashboardMeasureValueFilters,
                    targetDashboardAttributeFilterConfigs,
                    isDrillDown,
                    isDrillToDashboard,
                    enableMeasureValueFilter,
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
        targetDashboardTextAttributeFilters,
        targetDashboardMeasureValueFilters,
        targetDashboardAttributeFilterConfigs,
        isDrillDown,
        isDrillToDashboard,
        enableMeasureValueFilter,
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
                    targetDashboardTextAttributeFilters,
                    targetDashboardAttributeFilterConfigs,
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
        targetDashboardTextAttributeFilters,
        targetDashboardAttributeFilterConfigs,
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
                    allCatalogMeasures,
                    allCatalogDateDatasets,
                    dateFilterConfigOverride,
                    allDateFilterConfigsOverrides,
                    sourceDashboardAttributeFilterConfigs,
                    targetDashboardFilters,
                    targetDashboardMeasureValueFilters,
                    targetInsightCompatibleMeasureValueFilters,
                    targetDashboardAttributeFilters,
                    targetDashboardTextAttributeFilters,
                    targetDashboardAttributeFilterConfigs,
                    isDrillDown,
                    isDrillToInsight,
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
        allCatalogMeasures,
        allCatalogDateDatasets,
        dateFilterConfigOverride,
        allDateFilterConfigsOverrides,
        sourceDashboardAttributeFilterConfigs,
        targetDashboardFilters,
        targetDashboardAttributeFilters,
        targetDashboardTextAttributeFilters,
        targetDashboardMeasureValueFilters,
        targetInsightCompatibleMeasureValueFilters,
        targetDashboardAttributeFilterConfigs,
        isDrillToDashboard,
        isDrillToInsight,
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

    const dashboardSelection = useMemo(
        () =>
            dashboardFiltersOptions
                .map((option) => option.id)
                .filter((id) => !currentSelection.ignoredDashboardFilters?.includes(id)),
        [dashboardFiltersOptions, currentSelection.ignoredDashboardFilters],
    );
    const sourceInsightSelection = useMemo(
        () =>
            sourceInsightFiltersOptions
                .filter((option) =>
                    currentSelection.includedSourceInsightFiltersObjRefs?.some(
                        (includedFilter) =>
                            option.sourceInsightFilterObjRef &&
                            isSourceInsightFilterObjRefEqual(
                                includedFilter,
                                option.sourceInsightFilterObjRef,
                            ),
                    ),
                )
                .map((option) => option.id),
        [sourceInsightFiltersOptions, currentSelection.includedSourceInsightFiltersObjRefs],
    );

    const duplicateMetricFilterMessage = intl.formatMessage(
        messages.drillToDashboardDuplicateMetricFilterTooltip,
    );
    const selectedDashboardMetricFilterRefs = useMemo(
        () => getSelectedMetricFilterRefs(dashboardFiltersOptions, dashboardSelection),
        [dashboardFiltersOptions, dashboardSelection],
    );
    const selectedSourceInsightMetricFilterRefs = useMemo(
        () => getSelectedMetricFilterRefs(sourceInsightFiltersOptions, sourceInsightSelection),
        [sourceInsightFiltersOptions, sourceInsightSelection],
    );
    const dashboardFiltersOptionsWithDuplicateMetricState = useMemo(
        () =>
            applyDuplicateMetricFilterState(
                dashboardFiltersOptions,
                dashboardSelection,
                isDrillToDashboard ? selectedSourceInsightMetricFilterRefs : [],
                duplicateMetricFilterMessage,
            ),
        [
            dashboardFiltersOptions,
            dashboardSelection,
            isDrillToDashboard,
            selectedSourceInsightMetricFilterRefs,
            duplicateMetricFilterMessage,
        ],
    );
    const sourceInsightFiltersOptionsWithDuplicateMetricState = useMemo(
        () =>
            applyDuplicateMetricFilterState(
                sourceInsightFiltersOptions,
                sourceInsightSelection,
                isDrillToDashboard ? selectedDashboardMetricFilterRefs : [],
                duplicateMetricFilterMessage,
            ),
        [
            sourceInsightFiltersOptions,
            sourceInsightSelection,
            isDrillToDashboard,
            selectedDashboardMetricFilterRefs,
            duplicateMetricFilterMessage,
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
        sourceInsightFiltersOptions: sourceInsightFiltersOptionsWithDuplicateMetricState,
        sourceMeasureFiltersOptions,
        dashboardFiltersOptions: dashboardFiltersOptionsWithDuplicateMetricState,
        drillIntersectionIgnoredAttributes: currentSelection.drillIntersectionIgnoredAttributes ?? [],
        includedSourceInsightFiltersObjRefs: currentSelection.includedSourceInsightFiltersObjRefs ?? [],
        ignoredDashboardFilters: currentSelection.ignoredDashboardFilters ?? [],
        includedSourceMeasureFiltersObjRefs: currentSelection.includedSourceMeasureFiltersObjRefs ?? [],
        onDrillFiltersChange,
    };
}

function getSelectedMetricFilterRefs(
    options: IDrillFiltersConfigOption[],
    selectedIds: string[],
): ObjRefInScope[] {
    return options.flatMap((option) =>
        option.metricFilterMeasureRef && isDrillFiltersConfigOptionSelected(option, selectedIds)
            ? [option.metricFilterMeasureRef]
            : [],
    );
}

function applyDuplicateMetricFilterState(
    options: IDrillFiltersConfigOption[],
    selectedIds: string[],
    selectedMetricFilterRefsFromOtherSection: ObjRefInScope[],
    message: string,
): IDrillFiltersConfigOption[] {
    if (!selectedMetricFilterRefsFromOtherSection.length) {
        return options;
    }

    return options.map((option) => {
        const metricFilterMeasureRef = option.metricFilterMeasureRef;

        if (
            option.disabled ||
            !metricFilterMeasureRef ||
            isDrillFiltersConfigOptionSelected(option, selectedIds) ||
            !selectedMetricFilterRefsFromOtherSection.some((measureRef) =>
                areObjRefsEqual(measureRef, metricFilterMeasureRef),
            )
        ) {
            return option;
        }

        return {
            ...option,
            disabled: {
                message,
                selected: false,
            },
        };
    });
}
