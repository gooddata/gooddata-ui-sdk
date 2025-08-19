// (C) 2024-2025 GoodData Corporation

import { useIntl } from "react-intl";
import { v4 as uuidv4 } from "uuid";

import {
    FilterContextItem,
    IAttributeElement,
    ObjRef,
    getAttributeElementsItems,
    isAllTimeDashboardDateFilter,
    isAllValuesDashboardAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilterWithDimension,
    serializeObjRef,
} from "@gooddata/sdk-model";
import {
    DateFilterHelpers,
    getAttributeFilterSubtitle,
    getLocalizedIcuDateFormatPattern,
} from "@gooddata/sdk-ui-filters";

import { useCommonDateFilterTitle } from "./useCommonDateFilterTitle.js";
import { useDateFiltersTitles } from "./useDateFiltersTitles.js";
import {
    selectAllCatalogAttributesMap,
    selectAttributeFilterDisplayFormsMap,
    selectLocale,
    selectSettings,
    useDashboardSelector,
} from "../../model/index.js";
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

export function useFiltersNamings(filtersToDisplay: FilterContextItem[]): (FilterNaming | undefined)[] {
    const intl = useIntl();
    const locale = useDashboardSelector(selectLocale);
    const settings = useDashboardSelector(selectSettings);

    const dateFormat = settings.formatLocale
        ? getLocalizedIcuDateFormatPattern(settings.formatLocale)
        : settings.responsiveUiDateFormat;
    const dfMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const attrMap = useDashboardSelector(selectAllCatalogAttributesMap);
    const dateFiltersToDisplay = filtersToDisplay.filter(isDashboardDateFilterWithDimension);
    const commonDateFilterTitle = useCommonDateFilterTitle(intl);
    const allDateFiltersTitlesObj = useDateFiltersTitles(dateFiltersToDisplay, intl);

    // we want to show all time filter in the list of filters even if it is not stored
    const extendedFiltersToDisplay = ensureAllTimeFilterForExport(filtersToDisplay);

    return extendedFiltersToDisplay.map((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            const displayForm = dfMap.get(filter.attributeFilter.displayForm);
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
        } else {
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
            const subtitle = DateFilterHelpers.getDateFilterTitle(dateFilterOption, locale, dateFormat);

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
        }
    });
}
