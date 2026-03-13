// (C) 2020-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfig,
    type IDashboardDateFilterConfigItem,
    type ObjRef,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";

import { type ObjRefMap } from "../../../../../../_staging/metadata/objRefMap.js";
import {
    getDashboardDateFilterCustomTitle,
    getDateDatasetTitle,
    getDisabledOptionProps,
    getDisplayFormTitle,
    hasMatchingTargetDashboardAttributeFilter,
    hasMatchingTargetDashboardDateFilter,
} from "../drillFiltersConfigUtils.js";
import { messages } from "../messages.js";
import { type IDrillFiltersConfigOption } from "../types.js";

interface IMapDashboardFilterToOptionParams {
    dashboardFilter: FilterContextItem;
    allCatalogDisplayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>;
    allCatalogDateDatasets: Array<{ dataSet: { ref: ObjRef; title?: string } }>;
    dateFilterConfigOverride: IDashboardDateFilterConfig | undefined;
    allDateFilterConfigsOverrides: IDashboardDateFilterConfigItem[];
    sourceDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[];
    targetDashboardFilters: FilterContextItem[];
    targetDashboardAttributeFilters: IDashboardAttributeFilter[];
    targetDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[];
    isDrillDown: boolean;
    isDrillToDashboard: boolean;
    intl: IntlShape;
}

export function mapDashboardFilterToOption({
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
}: IMapDashboardFilterToOptionParams): IDrillFiltersConfigOption | undefined {
    const disabled = getDisabledOptionProps(
        isDrillDown,
        intl.formatMessage(messages.drillDownDashboardFilterTooltip),
        true,
    );

    if (isDashboardAttributeFilter(dashboardFilter)) {
        const displayFormRef = dashboardFilter.attributeFilter.displayForm;
        const localIdentifier = dashboardFilter.attributeFilter.localIdentifier;
        const customTitle = dashboardFilter.attributeFilter.title;

        if (!localIdentifier) {
            return undefined;
        }

        // In case of drill to dashboard, we need to check if the attribute filter is available
        // on the target dashboard. Otherwise disable the option.
        const hasMatchingTargetAttributeFilter = hasMatchingTargetDashboardAttributeFilter(
            dashboardFilter,
            sourceDashboardAttributeFilterConfigs,
            targetDashboardAttributeFilters,
            targetDashboardAttributeFilterConfigs,
            allCatalogDisplayFormsMap,
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
            ...getDisabledOptionProps(
                isDrillToDashboard && !hasMatchingTargetAttributeFilter,
                intl.formatMessage(messages.drillToDashboardDashboardFilterTooltip),
                false,
            ),
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

    return undefined;
}
