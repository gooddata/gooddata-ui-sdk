// (C) 2024-2026 GoodData Corporation

import { useIntl } from "react-intl";
import { v4 as uuidv4 } from "uuid";

import {
    type FilterContextItem,
    type IAttributeElement,
    type ObjRef,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardAttributeFilterItemTitle,
    getAttributeElementsItems,
    isAllTimeDashboardDateFilter,
    isAllValuesDashboardAttributeFilter,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardDateFilterWithDimension,
    isDashboardMatchAttributeFilter,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { type ILocale } from "@gooddata/sdk-ui";
import {
    DateFilterHelpers,
    type TextFilterOperator,
    getAttributeFilterSubtitle,
    getLocalizedIcuDateFormatPattern,
    getTextFilterStateText,
} from "@gooddata/sdk-ui-filters";

import { useAttributeFilterDisplayFormFromMap } from "./useAttributeFilterDisplayFormFromMap.js";
import { useCommonDateFilterTitle } from "./useCommonDateFilterTitle.js";
import { useDateFiltersTitles } from "./useDateFiltersTitles.js";
import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectAllCatalogAttributesMap } from "../../model/store/catalog/catalogSelectors.js";
import { selectLocale, selectSettings } from "../../model/store/config/configSelectors.js";
import { convertDateFilterConfigToDateFilterOptions } from "../dateFilterConfig/dateFilterConfigConverters.js";
import { matchDateFilterToDateFilterOptionWithPreference } from "../dateFilterConfig/dateFilterOptionMapping.js";
import { defaultDateFilterConfig } from "../dateFilterConfig/defaultConfig.js";
import { ensureAllTimeFilterForExport } from "../exportUtils/filterUtils.js";

export type FilterNaming = {
    type: "attributeFilter" | "dateFilter";
    all: boolean;
    id: string;
    title: string;
    subtitle: string;
    common?: true;
    dataSet?: ObjRef;
};

type FilterNamingDependencies = {
    intl: ReturnType<typeof useIntl>;
    locale: ILocale;
    dateFormat: string | undefined;
    getAttributeFilterDisplayFormFromMap: ReturnType<typeof useAttributeFilterDisplayFormFromMap>;
    attrMap: ReturnType<typeof selectAllCatalogAttributesMap>;
    commonDateFilterTitle: string | undefined;
    allDateFiltersTitlesObj: Record<string, string>;
};

/**
 * Hook that gathers all dependencies needed for filter naming transformations.
 * Reusable across different hooks that need to transform filters to namings.
 *
 * @param filtersForTitles - Array of filters (date filters will be extracted for titles)
 * @returns Object containing all dependencies needed for filter naming transformations
 */
function useFilterNamingDependencies(filtersForTitles: FilterContextItem[]): FilterNamingDependencies {
    const intl = useIntl();
    const locale = useDashboardSelector(selectLocale);
    const settings = useDashboardSelector(selectSettings);
    const dateFormat = settings.formatLocale
        ? getLocalizedIcuDateFormatPattern(settings.formatLocale)
        : settings.responsiveUiDateFormat;
    const getAttributeFilterDisplayFormFromMap = useAttributeFilterDisplayFormFromMap();
    const attrMap = useDashboardSelector(selectAllCatalogAttributesMap);
    const dateFiltersForTitles = filtersForTitles.filter(isDashboardDateFilterWithDimension);
    const commonDateFilterTitle = useCommonDateFilterTitle(intl);
    const allDateFiltersTitlesObj = useDateFiltersTitles(dateFiltersForTitles, intl);

    return {
        intl,
        locale,
        dateFormat,
        getAttributeFilterDisplayFormFromMap,
        attrMap,
        commonDateFilterTitle,
        allDateFiltersTitlesObj,
    };
}

/**
 * Pure function that transforms filters into filter namings.
 * Extracted to avoid code duplication between useFiltersNamings and useFiltersByTabNamings.
 */
function transformFiltersToNamings(
    filtersToDisplay: FilterContextItem[],
    deps: FilterNamingDependencies,
): (FilterNaming | undefined)[] {
    const {
        intl,
        dateFormat,
        getAttributeFilterDisplayFormFromMap,
        attrMap,
        commonDateFilterTitle,
        allDateFiltersTitlesObj,
    } = deps;

    // we want to show all time filter in the list of filters even if it is not stored
    const extendedFiltersToDisplay = ensureAllTimeFilterForExport(filtersToDisplay);

    return extendedFiltersToDisplay.map((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            const displayForm = getAttributeFilterDisplayFormFromMap(filter.attributeFilter.displayForm);
            if (!displayForm) {
                return undefined;
            }

            const attribute = attrMap.get(displayForm.attribute);
            if (!attribute) {
                return undefined;
            }

            const valuesAsAttributeElements: IAttributeElement[] = getAttributeElementsItems(
                filter.attributeFilter.attributeElements,
            )?.map((element) => ({
                title: element,
                uri: element,
            }));
            const subtitle = getAttributeFilterSubtitle(
                filter.attributeFilter.negativeSelection,
                valuesAsAttributeElements,
                intl,
            );

            return {
                type: "attributeFilter",
                all: isAllValuesDashboardAttributeFilter(filter),
                id: filter.attributeFilter.localIdentifier!,
                title: filter.attributeFilter.title ?? attribute.attribute.title,
                subtitle,
            };
        } else if (isDashboardDateFilter(filter)) {
            /**
             * Shenanigans inspired by core date filter and dashboard date filter implementation
             * to get the date filter option for its subtitle.
             */
            const dateFilterOptionInfo = matchDateFilterToDateFilterOptionWithPreference(
                filter,
                convertDateFilterConfigToDateFilterOptions(defaultDateFilterConfig),
                undefined,
            );
            const dateFilterOption = DateFilterHelpers.applyExcludeCurrentPeriod(
                dateFilterOptionInfo.dateFilterOption,
                dateFilterOptionInfo.excludeCurrentPeriod,
            );
            const subtitle = DateFilterHelpers.getDateFilterTitleUsingTranslator(
                dateFilterOption!,
                intl,
                "full",
                dateFormat,
            );

            const a = filter;
            if (isDashboardDateFilterWithDimension(a)) {
                const key = serializeObjRef(a.dateFilter.dataSet!);
                return {
                    type: "dateFilter",
                    all: isAllTimeDashboardDateFilter(a),
                    id: a.dateFilter.localIdentifier ?? uuidv4(),
                    title: allDateFiltersTitlesObj[key],
                    subtitle,
                    dataSet: a.dateFilter.dataSet,
                };
            }

            const b = filter;
            if (isDashboardCommonDateFilter(b)) {
                return {
                    type: "dateFilter",
                    common: true,
                    all: isAllTimeDashboardDateFilter(b),
                    id: b.dateFilter.localIdentifier ?? uuidv4(),
                    title: commonDateFilterTitle || intl.formatMessage({ id: "dateFilterDropdown.title" }),
                    subtitle,
                };
            }

            return undefined;
        } else if (isDashboardArbitraryAttributeFilter(filter)) {
            const { values, negativeSelection, displayForm } = filter.arbitraryAttributeFilter;
            const filterDisplayForm = getAttributeFilterDisplayFormFromMap(displayForm);
            if (!filterDisplayForm) {
                return undefined;
            }
            const attribute = attrMap.get(filterDisplayForm.attribute);
            if (!attribute) {
                return undefined;
            }
            const operator: TextFilterOperator =
                values.length === 0 && negativeSelection ? "all" : negativeSelection ? "isNot" : "is";
            const subtitle = getTextFilterStateText(operator, values, "", intl);
            const title = dashboardAttributeFilterItemTitle(filter) ?? attribute.attribute.title;
            return {
                type: "attributeFilter",
                all: values.length === 0 && negativeSelection,
                id: dashboardAttributeFilterItemLocalIdentifier(filter)!,
                title,
                subtitle,
            };
        } else if (isDashboardMatchAttributeFilter(filter)) {
            const {
                operator: matchOperator,
                literal,
                negativeSelection,
                displayForm,
            } = filter.matchAttributeFilter;
            const filterDisplayForm = getAttributeFilterDisplayFormFromMap(displayForm);
            if (!filterDisplayForm) {
                return undefined;
            }
            const attribute = attrMap.get(filterDisplayForm.attribute);
            if (!attribute) {
                return undefined;
            }
            const isNegative = negativeSelection ?? false;
            const operatorMap: Record<string, TextFilterOperator> = {
                contains: isNegative ? "doesNotContain" : "contains",
                startsWith: isNegative ? "doesNotStartWith" : "startsWith",
                endsWith: isNegative ? "doesNotEndWith" : "endsWith",
            };
            const operator: TextFilterOperator = operatorMap[matchOperator] ?? "contains";
            const subtitle = getTextFilterStateText(operator, [], literal, intl);
            const title = dashboardAttributeFilterItemTitle(filter) ?? attribute.attribute.title;
            return {
                type: "attributeFilter",
                all: false,
                id: dashboardAttributeFilterItemLocalIdentifier(filter)!,
                title,
                subtitle,
            };
        } else {
            return undefined;
        }
    });
}

export function useFiltersNamings(filtersToDisplay: FilterContextItem[]): (FilterNaming | undefined)[] {
    const deps = useFilterNamingDependencies(filtersToDisplay);

    return transformFiltersToNamings(filtersToDisplay, deps);
}

export function useFiltersByTabNamings(
    tabFilters: Record<string, FilterContextItem[]>,
): Record<string, (FilterNaming | undefined)[]> {
    // Collect all filters from all tabs for titles lookup
    const allFilters = Object.values(tabFilters).flat();
    const deps = useFilterNamingDependencies(allFilters);

    // Process each tab's filters separately using the shared transformation function
    const result: Record<string, (FilterNaming | undefined)[]> = {};

    Object.entries(tabFilters).forEach(([tabId, filters]) => {
        result[tabId] = transformFiltersToNamings(filters, deps);
    });

    return result;
}
