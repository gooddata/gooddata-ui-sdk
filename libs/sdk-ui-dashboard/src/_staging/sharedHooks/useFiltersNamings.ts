// (C) 2024 GoodData Corporation

import {
    FilterContextItem,
    getAttributeElementsItems,
    IAttributeElement,
    isDashboardAttributeFilter,
    isDashboardDateFilterWithDimension,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import {
    DateFilterHelpers,
    getAttributeFilterSubtitle,
    getLocalizedIcuDateFormatPattern,
} from "@gooddata/sdk-ui-filters";
import { v4 as uuidv4 } from "uuid";
import { useIntl } from "react-intl";

import { matchDateFilterToDateFilterOptionWithPreference } from "../dateFilterConfig/dateFilterOptionMapping.js";
import { defaultDateFilterConfig } from "../dateFilterConfig/defaultConfig.js";
import { ensureAllTimeFilterForExport } from "../exportUtils/filterUtils.js";
import {
    selectAllCatalogAttributesMap,
    selectAttributeFilterDisplayFormsMap,
    selectLocale,
    selectSettings,
    useDashboardSelector,
} from "../../model/index.js";
import { useCommonDateFilterTitle } from "./useCommonDateFilterTitle.js";
import { useDateFiltersTitles } from "./useDateFiltersTitles.js";

export function useFiltersNamings(filtersToDisplay: FilterContextItem[]) {
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
}
