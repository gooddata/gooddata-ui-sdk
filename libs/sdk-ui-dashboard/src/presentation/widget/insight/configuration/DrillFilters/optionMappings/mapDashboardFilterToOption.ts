// (C) 2020-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type DashboardTextAttributeFilter,
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogMeasure,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IDashboardMeasureValueFilter,
    type ObjRef,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardAttributeFilterItemTitle,
    dashboardFilterObjRef,
    dashboardMeasureValueFilterLocalIdentifier,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardDateFilter,
    isDashboardMeasureValueFilter,
} from "@gooddata/sdk-model";

import { type ObjRefMap } from "../../../../../../_staging/metadata/objRefMap.js";
import {
    canTransferDashboardAttributeFilter,
    canTransferTextAttributeFilter,
    getCatalogMeasureTitle,
    getDashboardDateFilterCustomTitle,
    getDateDatasetTitle,
    getDisabledOptionProps,
    getDisabledOptionPropsForTransferResult,
    getDisplayFormTitle,
    hasCompatibleTargetInsightMeasureValueFilter,
    hasMatchingTargetDashboardDateFilter,
    hasMatchingTargetDashboardMeasureValueFilter,
} from "../drillFiltersConfigUtils.js";
import { messages } from "../messages.js";
import { type IDrillFiltersConfigOption } from "../types.js";

interface IMapDashboardFilterToOptionParams {
    dashboardFilter: FilterContextItem;
    allCatalogDisplayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>;
    allCatalogMeasures: ICatalogMeasure[];
    allCatalogDateDatasets: Array<{ dataSet: { ref: ObjRef; title?: string } }>;
    dateFilterConfigOverride: IDashboardDateFilterConfig | undefined;
    allDateFilterConfigsOverrides: IDashboardDateFilterConfigItem[];
    sourceDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[];
    targetDashboardFilters: FilterContextItem[];
    targetDashboardAttributeFilters: IDashboardAttributeFilter[];
    targetDashboardTextAttributeFilters: DashboardTextAttributeFilter[];
    targetDashboardMeasureValueFilters: IDashboardMeasureValueFilter[];
    targetInsightCompatibleMeasureValueFilters: IDashboardMeasureValueFilter[];
    targetDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[];
    isDrillDown: boolean;
    isDrillToInsight: boolean;
    isDrillToDashboard: boolean;
    intl: IntlShape;
}

export function mapDashboardFilterToOption({
    dashboardFilter,
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
    isDrillDown,
    isDrillToInsight,
    isDrillToDashboard,
    intl,
}: IMapDashboardFilterToOptionParams): IDrillFiltersConfigOption | undefined {
    const disabled = getDisabledOptionProps(
        isDrillDown,
        intl.formatMessage(messages.drillDownDashboardFilterTooltip),
        true,
    );

    if (isDashboardAttributeFilterItem(dashboardFilter)) {
        const displayFormRef = dashboardAttributeFilterItemDisplayForm(dashboardFilter);
        const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(dashboardFilter);
        const customTitle = dashboardAttributeFilterItemTitle(dashboardFilter);

        if (!localIdentifier) {
            return undefined;
        }

        // In case of drill to dashboard, we need to check if the attribute filter is available
        // on the target dashboard. Otherwise disable the option.
        // This considers both list and text filters on the target, and selection type config.
        const transferResult = isDashboardAttributeFilter(dashboardFilter)
            ? canTransferDashboardAttributeFilter(
                  dashboardFilter,
                  sourceDashboardAttributeFilterConfigs,
                  targetDashboardAttributeFilters,
                  targetDashboardAttributeFilterConfigs,
                  targetDashboardTextAttributeFilters,
                  allCatalogDisplayFormsMap,
              )
            : canTransferTextAttributeFilter(
                  dashboardFilter,
                  targetDashboardAttributeFilters,
                  targetDashboardAttributeFilterConfigs,
                  targetDashboardTextAttributeFilters,
              );

        return {
            id: localIdentifier,
            title:
                customTitle ??
                getDisplayFormTitle({
                    displayFormRef,
                    allCatalogDisplayFormsMap,
                }),
            ...disabled,
            ...getDisabledOptionPropsForTransferResult(isDrillToDashboard, transferResult, intl),
        };
    }

    if (isDashboardDateFilter(dashboardFilter)) {
        const localIdentifier = dashboardFilter.dateFilter.localIdentifier;

        if (!localIdentifier) {
            return undefined;
        }

        const datasetRef = dashboardFilter.dateFilter.dataSet;

        // common date filter
        if (!datasetRef) {
            return {
                id: localIdentifier,
                title:
                    dateFilterConfigOverride?.filterName ??
                    intl.formatMessage(messages.commonDateFilterTitle),
                ...disabled,
            };
        }

        // date filter with dimension
        const customTitle = getDashboardDateFilterCustomTitle({
            datasetRef,
            allDateFilterConfigsOverrides,
        });
        const hasMatchingTargetDateFilter = hasMatchingTargetDashboardDateFilter(
            datasetRef,
            targetDashboardFilters,
        );

        return {
            id: localIdentifier,
            title:
                customTitle ??
                getDateDatasetTitle({
                    datasetRef,
                    allCatalogDateDatasets,
                }),
            ...disabled,
            ...getDisabledOptionProps(
                isDrillToDashboard && !hasMatchingTargetDateFilter,
                intl.formatMessage(messages.drillToDashboardDashboardFilterTooltip),
                false,
            ),
        };
    }

    if (isDashboardMeasureValueFilter(dashboardFilter)) {
        const measure = dashboardFilterObjRef(dashboardFilter)!;
        const localIdentifier = dashboardMeasureValueFilterLocalIdentifier(dashboardFilter);
        const title = dashboardFilter.dashboardMeasureValueFilter.title;

        const hasMatchingTargetMeasureValueFilter = hasMatchingTargetDashboardMeasureValueFilter(
            measure,
            targetDashboardMeasureValueFilters,
        );
        const compatible = hasCompatibleTargetInsightMeasureValueFilter(
            measure,
            targetInsightCompatibleMeasureValueFilters,
        );

        return {
            id: localIdentifier,
            title: title ?? getCatalogMeasureTitle(measure, allCatalogMeasures),
            metricFilterMeasureRef: measure,
            ...disabled,
            ...getDisabledOptionProps(
                isDrillToDashboard && !hasMatchingTargetMeasureValueFilter,
                intl.formatMessage(messages.drillToDashboardDashboardFilterTooltip),
                false,
            ),
            ...getDisabledOptionProps(
                isDrillToInsight && !compatible,
                intl.formatMessage(messages.drillToInsightMeasureValueFilterTooltip),
                false,
            ),
        };
    }

    return undefined;
}
