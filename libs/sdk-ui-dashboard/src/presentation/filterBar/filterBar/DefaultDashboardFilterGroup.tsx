// (C) 2021-2026 GoodData Corporation

import { type ComponentType, type ReactElement, type ReactNode, useCallback, useMemo } from "react";

import { isEmpty } from "lodash-es";
import { useIntl } from "react-intl";

import {
    DashboardAttributeFilterConfigModeValues,
    dashboardFilterLocalIdentifier,
    getSelectedElementsCount,
} from "@gooddata/sdk-model";
import {
    AttributeFilterDependencyTooltip,
    FilterGroup,
    type IAttributeFilterProps,
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
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../../model/store/config/configSelectors.js";
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

    const getFilterIdentifier = useCallback((filter: FilterBarAttributeFilterIndexed) => {
        return dashboardFilterLocalIdentifier(filter.filter)!;
    }, []);

    const hasSelectedElements = useCallback((filter: FilterBarAttributeFilterIndexed) => {
        return getSelectedElementsCount(filter.filter) > 0;
    }, []);

    const renderFilter = useCallback(
        (
            filter: FilterBarAttributeFilterIndexed,
            AttributeFilterComponent?: ComponentType<IAttributeFilterProps>,
        ): ReactElement => {
            const displayAsLabel = attributeFiltersDisplayAsLabelMap.get(
                filter.filter.attributeFilter.localIdentifier!,
            );
            const attributeFilterMode = attributeFiltersModeMap.get(
                filter.filter.attributeFilter.localIdentifier!,
            );
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
                if (supportElementUris) {
                    return filter;
                }
                return {
                    ...filter,
                    filter: convertDashboardAttributeFilterElementsUrisToValues(filter.filter),
                };
            })
            .filter((filter): filter is FilterBarAttributeFilterIndexed => filter !== undefined)
            .filter(
                (filter) =>
                    attributeFiltersModeMap.get(filter.filter.attributeFilter.localIdentifier!) !==
                    DashboardAttributeFilterConfigModeValues.HIDDEN,
            );
    }, [groupItem.filters, supportElementUris, attributeFiltersModeMap]);

    const filterDependenciesByLocalId = useMemo(() => {
        return new Map<string, boolean>(
            itemFilters.map((filter) => {
                const { localIdentifier, filterElementsBy, filterElementsByDate } =
                    filter.filter.attributeFilter;
                const isDependent = !isEmpty(filterElementsBy) || !isEmpty(filterElementsByDate);
                return [localIdentifier!, isDependent];
            }),
        );
    }, [itemFilters]);

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
