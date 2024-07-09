// (C) 2024 GoodData Corporation

import { v4 as uuidv4 } from "uuid";
import {
    DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    DashboardDateFilterConfigMode,
    DashboardDateFilterConfigModeValues,
    FilterContextItem,
    getAttributeElementsItems,
    IAttributeElement,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardDateFilterWithDimension,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import isEqual from "lodash/isEqual.js";
import { useIntl } from "react-intl";
import {
    ICrossFilteringItem,
    selectAllCatalogAttributesMap,
    selectAttributeFilterDisplayFormsMap,
    selectCrossFilteringItems,
    selectEffectiveAttributeFiltersModeMap,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFiltersModeMap,
    selectFilterContextFilters,
    selectLocale,
    selectOriginalFilterContextFilters,
    selectSettings,
    useDashboardSelector,
} from "../../../../model/index.js";
import { matchDateFilterToDateFilterOptionWithPreference } from "../../../../_staging/dateFilterConfig/dateFilterOptionMapping.js";
import { defaultDateFilterConfig } from "../../../../_staging/dateFilterConfig/defaultConfig.js";
import {
    DateFilterHelpers,
    DateFilterOption,
    getAttributeFilterSubtitle,
    getLocalizedIcuDateFormatPattern,
} from "@gooddata/sdk-ui-filters";
import { useCommonDateFilterTitle } from "../../../../_staging/sharedHooks/useCommonDateFilterTitle.js";
import { useDateFiltersTitles } from "../../../../_staging/sharedHooks/useDateFiltersTitles.js";

export interface IAttachmentFilterInfo {
    id: string;
    title: string;
    subtitle: string;
    attributeFilterValues?: (string | null)[];
    isAttributeFilterNegative?: boolean;
    dateFilterOption?: DateFilterOption;
}

interface IUseAttachmentDashboardFilters {
    /**
     * Is there some ad-hoc change of filters on the dashboard compared to original filters state?
     *
     * @remarks Excluding cross-filtering.
     */
    areFiltersChanged: boolean;
    /**
     * Is cross filtering currently in action?
     */
    isCrossFiltering: boolean;
    /**
     * Dashboard filters without cross-filtering intended for metadata storing.
     */
    filtersToStore: FilterContextItem[];
    /**
     * Information about dashboard filters without cross-filtering and hidden filters intended for UI usage.
     */
    filtersToDisplayInfo: IAttachmentFilterInfo[];
}

export const useAttachmentDashboardFilters = ({
    customFilters,
}: {
    /**
     * Custom filters from metadata object to use instead of the current dashboard filters.
     */
    customFilters?: FilterContextItem[];
}): IUseAttachmentDashboardFilters => {
    const intl = useIntl();
    const locale = useDashboardSelector(selectLocale);
    const settings = useDashboardSelector(selectSettings);

    const dateFormat = settings.formatLocale
        ? getLocalizedIcuDateFormatPattern(settings.formatLocale)
        : settings.responsiveUiDateFormat;

    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const effectiveFilters = customFilters ? [...customFilters] : [...dashboardFilters];

    // remove cross-filtering to get filters for storing
    const crossFilteringItems = useDashboardSelector(selectCrossFilteringItems);
    const isCrossFiltering = crossFilteringItems.length > 0;
    const filtersToStore = removeCrossFilteringFilters(effectiveFilters, crossFilteringItems);

    // compare stored dashboard filters with filters to store
    const originalFilters = useDashboardSelector(selectOriginalFilterContextFilters);
    const areFiltersChanged = !isEqual(filtersToStore, originalFilters);

    // additionaly remove hidden filters to get filters suitable for display
    const commonDateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const dateFiltersModeMap = useDashboardSelector(selectEffectiveDateFiltersModeMap);
    const attributeFiltersModeMap = useDashboardSelector(selectEffectiveAttributeFiltersModeMap);
    const filtersToDisplay = removeHiddenFilters(
        filtersToStore,
        commonDateFilterMode,
        dateFiltersModeMap,
        attributeFiltersModeMap,
    );

    // collect information for visual list of filters
    const dfMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const attrMap = useDashboardSelector(selectAllCatalogAttributesMap);
    const dateFiltersToDisplay = filtersToDisplay.filter(isDashboardDateFilterWithDimension);
    const commonDateFilterTitle = useCommonDateFilterTitle(intl);
    const allDateFiltersTitlesObj = useDateFiltersTitles(dateFiltersToDisplay, intl);

    const filtersToDisplayInfo = filtersToDisplay.map((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            const displayForm = dfMap.get(filter.attributeFilter.displayForm);
            invariant(displayForm, "Inconsistent state in catalog");
            const attribute = attrMap.get(displayForm.attribute);
            invariant(attribute, "Inconsistent state in catalog");

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
                id: filter.attributeFilter.localIdentifier!,
                title: filter.attributeFilter.title ?? attribute.attribute.title,
                subtitle,
            };
        } else {
            /**
             * Shenanigans inspired by core date filter and dashboard date filter implementation
             * to get the date filter option for its subtitle.
             */
            const dateFilterOptionInfo = matchDateFilterToDateFilterOptionWithPreference(
                filter,
                defaultDateFilterConfig,
                undefined,
            );
            const dateFilterOption = DateFilterHelpers.applyExcludeCurrentPeriod(
                dateFilterOptionInfo.dateFilterOption,
                dateFilterOptionInfo.excludeCurrentPeriod,
            );
            const subtitle = DateFilterHelpers.getDateFilterTitle(dateFilterOption, locale, dateFormat);

            if (isDashboardDateFilterWithDimension(filter)) {
                const key = serializeObjRef(filter.dateFilter.dataSet!);
                return {
                    id: uuidv4(), // used just for React keys
                    title: allDateFiltersTitlesObj[key],
                    subtitle,
                };
            } else {
                return {
                    id: uuidv4(), // used just for React keys
                    title: commonDateFilterTitle || intl.formatMessage({ id: "dateFilterDropdown.title" }),
                    subtitle,
                };
            }
        }
    });

    return {
        areFiltersChanged,
        isCrossFiltering,
        filtersToStore,
        filtersToDisplayInfo,
    };
};

const removeCrossFilteringFilters = (
    filters: FilterContextItem[],
    crossFilteringItems: ICrossFilteringItem[],
) => {
    const crossFilteringFilterLocalIdentifiers = crossFilteringItems.flatMap(
        (item) => item.filterLocalIdentifiers,
    );

    return filters.filter((filter) => {
        if (isDashboardAttributeFilter(filter) && filter.attributeFilter.localIdentifier) {
            return !crossFilteringFilterLocalIdentifiers.includes(filter.attributeFilter.localIdentifier);
        }

        return true;
    });
};

const removeHiddenFilters = (
    filters: FilterContextItem[],
    commonDateFilterMode: DashboardDateFilterConfigMode,
    dateFiltersModeMap: Map<string, DashboardDateFilterConfigMode>,
    attributeFiltersModeMap: Map<string, DashboardAttributeFilterConfigMode>,
) => {
    return filters.filter((filter) => {
        if (isDashboardCommonDateFilter(filter)) {
            return commonDateFilterMode !== DashboardDateFilterConfigModeValues.HIDDEN;
        } else if (isDashboardDateFilter(filter) && filter.dateFilter.localIdentifier) {
            const mode = dateFiltersModeMap.get(filter.dateFilter.localIdentifier);
            return mode !== DashboardDateFilterConfigModeValues.HIDDEN;
        } else if (isDashboardAttributeFilter(filter) && filter.attributeFilter.localIdentifier) {
            const mode = attributeFiltersModeMap.get(filter.attributeFilter.localIdentifier);
            return mode !== DashboardAttributeFilterConfigModeValues.HIDDEN;
        }

        return true;
    });
};
