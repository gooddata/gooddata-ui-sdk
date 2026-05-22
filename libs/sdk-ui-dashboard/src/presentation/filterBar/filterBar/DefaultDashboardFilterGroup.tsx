// (C) 2021-2026 GoodData Corporation

import { type ComponentType, type ReactElement, type ReactNode, useCallback, useMemo } from "react";

import { isEmpty } from "lodash-es";
import { useIntl } from "react-intl";

import {
    DashboardAttributeFilterConfigModeValues,
    dashboardAttributeFilterItemFilterElementsBy,
    dashboardAttributeFilterItemFilterElementsByDate,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    getSelectedElementsCount,
    isAllDashboardMeasureValueFilter,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardMatchAttributeFilter,
    isDashboardMeasureValueFilter,
} from "@gooddata/sdk-model";
import {
    AttributeFilterDependencyTooltip,
    FilterGroup,
    type IAttributeFilterProps,
    type IMeasureValueFilterProps,
    useDeepEqualRefStablizer,
} from "@gooddata/sdk-ui-filters";

import { convertDashboardAttributeFilterElementsUrisToValues } from "../../../_staging/dashboard/legacyFilterConvertors.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    selectBackendCapabilities,
    selectSupportsElementUris,
} from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectEnableArbitraryFilterKD,
    selectEnableMatchFilterKD,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
} from "../../../model/store/config/configSelectors.js";
import {
    selectAttributeFilterConfigsDisplayAsLabelMap,
    selectEffectiveAttributeFiltersModeMap,
} from "../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectEffectiveMeasureValueFiltersModeMap } from "../../../model/store/tabs/measureValueFilterConfigs/measureValueFilterConfigsSelectors.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { DefaultDashboardAttributeFilter } from "../attributeFilter/DefaultDashboardAttributeFilter.js";
import type { IDashboardFilterGroupProps } from "../attributeFilter/types.js";
import { DefaultDashboardMeasureValueFilter } from "../measureValueFilter/DefaultDashboardMeasureValueFilter.js";

import {
    type FilterBarAttributeFilterIndexed,
    type FilterBarMeasureValueFilterIndexed,
    isFilterBarAttributeFilter,
    isFilterBarMeasureValueFilter,
} from "./useFiltersWithAddedPlaceholder.js";

type FilterBarGroupFilterIndexed = FilterBarAttributeFilterIndexed | FilterBarMeasureValueFilterIndexed;

/**
 * @alpha
 */
export function DefaultDashboardFilterGroup(props: IDashboardFilterGroupProps): ReactNode {
    const {
        groupItem,
        onAttributeFilterChanged,
        onMeasureValueFilterChanged,
        DashboardAttributeFilterComponent: CustomDashboardAttributeFilterComponent,
        DashboardMeasureValueFilterComponent: CustomDashboardMeasureValueFilterComponent,
    } = props;
    const intl = useIntl();
    const { DashboardMeasureValueFilterComponentProvider } = useDashboardComponentsContext();

    const supportElementUris = useDashboardSelector(selectSupportsElementUris);
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const attributeFiltersDisplayAsLabelMap = useDashboardSelector(
        selectAttributeFilterConfigsDisplayAsLabelMap,
    );
    const attributeFiltersModeMap = useDashboardSelector(selectEffectiveAttributeFiltersModeMap);
    const measureValueFiltersModeMap = useDashboardSelector(selectEffectiveMeasureValueFiltersModeMap);
    const enableArbitraryFilter = useDashboardSelector(selectEnableArbitraryFilterKD);
    const enableMatchFilter = useDashboardSelector(selectEnableMatchFilterKD);

    const getFilterIdentifier = useCallback((filter: FilterBarGroupFilterIndexed) => {
        if (isFilterBarAttributeFilter(filter)) {
            return dashboardAttributeFilterItemLocalIdentifier(filter.filter)!;
        }

        return dashboardFilterLocalIdentifier(filter.filter)!;
    }, []);

    const isFilterActive = useCallback((filter: FilterBarGroupFilterIndexed) => {
        if (isFilterBarMeasureValueFilter(filter)) {
            return !isAllDashboardMeasureValueFilter(filter.filter);
        }
        const dashboardFilter = filter.filter;
        if (isDashboardAttributeFilter(dashboardFilter)) {
            return getSelectedElementsCount(dashboardFilter) > 0;
        }
        if (isDashboardArbitraryAttributeFilter(dashboardFilter)) {
            return dashboardFilter.arbitraryAttributeFilter.values.length > 0;
        }
        if (isDashboardMatchAttributeFilter(dashboardFilter)) {
            return dashboardFilter.matchAttributeFilter.literal.length > 0;
        }
        return true;
    }, []);

    const renderFilter = useCallback(
        (
            filter: FilterBarGroupFilterIndexed,
            AttributeFilterComponent?: ComponentType<IAttributeFilterProps>,
            MeasureValueFilterComponent?: ComponentType<IMeasureValueFilterProps>,
        ): ReactElement => {
            if (isFilterBarMeasureValueFilter(filter)) {
                const localId = dashboardFilterLocalIdentifier(filter.filter)!;
                const measureValueFilterMode =
                    measureValueFiltersModeMap.get(localId) ??
                    DashboardAttributeFilterConfigModeValues.ACTIVE;
                const DashboardMeasureValueFilterComponent =
                    CustomDashboardMeasureValueFilterComponent ??
                    DashboardMeasureValueFilterComponentProvider(filter.filter) ??
                    DefaultDashboardMeasureValueFilter;

                return (
                    <DashboardMeasureValueFilterComponent
                        filter={filter.filter}
                        filterIndex={filter.filterIndex}
                        readonly={
                            measureValueFilterMode === DashboardAttributeFilterConfigModeValues.READONLY
                        }
                        onMeasureValueFilterChanged={onMeasureValueFilterChanged!}
                        MeasureValueFilterComponent={MeasureValueFilterComponent}
                        passDropdownButton={false}
                    />
                );
            }

            const localId = dashboardAttributeFilterItemLocalIdentifier(filter.filter)!;
            const displayAsLabel = attributeFiltersDisplayAsLabelMap.get(localId);
            const attributeFilterMode = attributeFiltersModeMap.get(localId);
            const DashboardAttributeFilterComponent =
                CustomDashboardAttributeFilterComponent ?? DefaultDashboardAttributeFilter;
            return (
                <DashboardAttributeFilterComponent
                    filter={filter.filter}
                    AttributeFilterComponent={AttributeFilterComponent}
                    onFilterChanged={onAttributeFilterChanged}
                    workingFilter={isApplyAllAtOnceEnabledAndSet ? filter.workingFilter : undefined}
                    displayAsLabel={displayAsLabel}
                    readonly={attributeFilterMode === DashboardAttributeFilterConfigModeValues.READONLY}
                    passDropdownButton={false}
                />
            );
        },
        [
            onAttributeFilterChanged,
            isApplyAllAtOnceEnabledAndSet,
            attributeFiltersDisplayAsLabelMap,
            attributeFiltersModeMap,
            CustomDashboardAttributeFilterComponent,
            CustomDashboardMeasureValueFilterComponent,
            DashboardMeasureValueFilterComponentProvider,
            measureValueFiltersModeMap,
            onMeasureValueFilterChanged,
        ],
    );

    const itemFilters = useMemo(() => {
        return groupItem.filters
            .map((filter): FilterBarGroupFilterIndexed | undefined => {
                if (isFilterBarMeasureValueFilter(filter)) {
                    return filter;
                }
                if (!isFilterBarAttributeFilter(filter)) {
                    return undefined;
                }
                // Text filter types (arbitrary, match) don't need URI conversion
                if (!isDashboardAttributeFilter(filter.filter)) {
                    return filter;
                }
                if (supportElementUris) {
                    return filter;
                }
                return {
                    ...filter,
                    filter: convertDashboardAttributeFilterElementsUrisToValues(filter.filter),
                };
            })
            .filter((filter): filter is FilterBarGroupFilterIndexed => filter !== undefined)
            .filter((filter) => {
                if (isDashboardMeasureValueFilter(filter.filter)) {
                    if (!onMeasureValueFilterChanged) {
                        return false;
                    }
                    const localId = dashboardFilterLocalIdentifier(filter.filter);
                    return (
                        measureValueFiltersModeMap.get(localId!) !==
                        DashboardAttributeFilterConfigModeValues.HIDDEN
                    );
                }
                const localId = dashboardAttributeFilterItemLocalIdentifier(filter.filter);
                return (
                    attributeFiltersModeMap.get(localId!) !== DashboardAttributeFilterConfigModeValues.HIDDEN
                );
            })
            .filter((filter) => {
                // Gate text filter types by feature flags
                if (isDashboardArbitraryAttributeFilter(filter.filter)) {
                    return enableArbitraryFilter;
                }
                if (isDashboardMatchAttributeFilter(filter.filter)) {
                    return enableMatchFilter;
                }
                return true;
            });
    }, [
        groupItem.filters,
        supportElementUris,
        attributeFiltersModeMap,
        measureValueFiltersModeMap,
        enableArbitraryFilter,
        enableMatchFilter,
        onMeasureValueFilterChanged,
    ]);

    const filterDependenciesByLocalIdUnstable = useMemo(() => {
        return new Map<string, boolean>(
            itemFilters.map((filter) => {
                if (isFilterBarMeasureValueFilter(filter)) {
                    return [dashboardFilterLocalIdentifier(filter.filter)!, false];
                }

                const localId = dashboardAttributeFilterItemLocalIdentifier(filter.filter)!;
                // Match filter type has no parent filter dependencies by design
                if (isDashboardMatchAttributeFilter(filter.filter)) {
                    return [localId, false];
                }
                const filterElementsBy = dashboardAttributeFilterItemFilterElementsBy(filter.filter);
                const filterElementsByDate = dashboardAttributeFilterItemFilterElementsByDate(filter.filter);
                const isDependent = !isEmpty(filterElementsBy) || !isEmpty(filterElementsByDate);
                return [localId, isDependent];
            }),
        );
    }, [itemFilters]);

    const filterDependenciesByLocalId = useDeepEqualRefStablizer(filterDependenciesByLocalIdUnstable);

    const getTitleExtension = useCallback(
        (filterIdentifier: string, filterTitle?: string) => {
            if (!capabilities.supportsKeepingDependentFiltersSelection) {
                return null;
            }
            const isDependent = filterDependenciesByLocalId.get(filterIdentifier);
            if (!isDependent) {
                return null;
            }
            const filterDependencyIconTooltip = intl.formatMessage(
                { id: "filter.dependency.icon.tooltip" },
                {
                    filterTitle,
                    strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                },
            );
            const filterDependencyIconAriaLabel = intl.formatMessage({
                id: "filter.dependency.icon.aria.label",
            });
            return (
                <AttributeFilterDependencyTooltip
                    tooltipContent={filterDependencyIconTooltip}
                    ariaLabel={filterDependencyIconAriaLabel}
                />
            );
        },
        [capabilities.supportsKeepingDependentFiltersSelection, filterDependenciesByLocalId, intl],
    );

    return (
        <FilterGroup<FilterBarGroupFilterIndexed>
            title={groupItem.groupConfig.title}
            filters={itemFilters}
            getFilterIdentifier={getFilterIdentifier}
            isFilterActive={isFilterActive}
            renderFilter={renderFilter}
            getTitleExtension={getTitleExtension}
        />
    );
}
