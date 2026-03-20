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
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardMatchAttributeFilter,
} from "@gooddata/sdk-model";
import {
    AttributeFilterDependencyTooltip,
    FilterGroup,
    type IAttributeFilterProps,
    useDeepEqualRefStablizer,
} from "@gooddata/sdk-ui-filters";

import {
    type FilterBarAttributeFilterIndexed,
    isFilterBarAttributeFilter,
} from "./useFiltersWithAddedPlaceholder.js";
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
import { DefaultDashboardAttributeFilter } from "../attributeFilter/DefaultDashboardAttributeFilter.js";
import type { IDashboardFilterGroupProps } from "../attributeFilter/types.js";

/**
 * @alpha
 */
export function DefaultDashboardFilterGroup(props: IDashboardFilterGroupProps): ReactNode {
    const {
        groupItem,
        onAttributeFilterChanged,
        DashboardAttributeFilterComponent: CustomDashboardAttributeFilterComponent,
    } = props;
    const intl = useIntl();

    const supportElementUris = useDashboardSelector(selectSupportsElementUris);
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const attributeFiltersDisplayAsLabelMap = useDashboardSelector(
        selectAttributeFilterConfigsDisplayAsLabelMap,
    );
    const attributeFiltersModeMap = useDashboardSelector(selectEffectiveAttributeFiltersModeMap);
    const enableArbitraryFilter = useDashboardSelector(selectEnableArbitraryFilterKD);
    const enableMatchFilter = useDashboardSelector(selectEnableMatchFilterKD);

    const getFilterIdentifier = useCallback((filter: FilterBarAttributeFilterIndexed) => {
        return (
            dashboardAttributeFilterItemLocalIdentifier(filter.filter) ??
            dashboardFilterLocalIdentifier(filter.filter)!
        );
    }, []);

    const hasSelectedElements = useCallback((filter: FilterBarAttributeFilterIndexed) => {
        if (isDashboardAttributeFilter(filter.filter)) {
            return getSelectedElementsCount(filter.filter) > 0;
        }
        if (isDashboardArbitraryAttributeFilter(filter.filter)) {
            return filter.filter.arbitraryAttributeFilter.values.length > 0;
        }
        if (isDashboardMatchAttributeFilter(filter.filter)) {
            return filter.filter.matchAttributeFilter.literal.length > 0;
        }
        return true;
    }, []);

    const renderFilter = useCallback(
        (
            filter: FilterBarAttributeFilterIndexed,
            AttributeFilterComponent?: ComponentType<IAttributeFilterProps>,
        ): ReactElement => {
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
        ],
    );

    const itemFilters = useMemo(() => {
        return groupItem.filters
            .map((filter): FilterBarAttributeFilterIndexed | undefined => {
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
            .filter((filter): filter is FilterBarAttributeFilterIndexed => filter !== undefined)
            .filter((filter) => {
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
        enableArbitraryFilter,
        enableMatchFilter,
    ]);

    const filterDependenciesByLocalIdUnstable = useMemo(() => {
        return new Map<string, boolean>(
            itemFilters.map((filter) => {
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
            return <AttributeFilterDependencyTooltip tooltipContent={filterDependencyIconTooltip} />;
        },
        [capabilities.supportsKeepingDependentFiltersSelection, filterDependenciesByLocalId, intl],
    );

    return (
        <FilterGroup<FilterBarAttributeFilterIndexed>
            title={groupItem.groupConfig.title}
            filters={itemFilters}
            getFilterIdentifier={getFilterIdentifier}
            hasSelectedElements={hasSelectedElements}
            renderFilter={renderFilter}
            getTitleExtension={getTitleExtension}
        />
    );
}
