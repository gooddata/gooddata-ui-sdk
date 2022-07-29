// (C) 2021-2022 GoodData Corporation
import { IntlShape } from "react-intl";
import { IListItem } from "../Components/types";
import { filterIsEmpty, IAttributeFilter } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";

export const getAllTitleIntl = (
    intl: IntlShape,
    isInverted: boolean,
    empty: boolean,
    equal: boolean,
): string => {
    if ((isInverted && empty) || (!isInverted && equal)) {
        return getAllTitle(intl);
    }
    return getAllExceptTitle(intl);
};

export const getAllTitle = (intl: IntlShape): string => {
    return intl.formatMessage({ id: "attrf.all" });
};

export const getAllExceptTitle = (intl: IntlShape): string => {
    return intl.formatMessage({ id: "attrf.all_except" });
};

export const getLoadingTitleIntl = (intl: IntlShape): string => {
    return intl.formatMessage({ id: "loading" });
};

export const getFilteringTitleIntl = (intl: IntlShape): string => {
    return intl.formatMessage({ id: "filtering" });
};

export const getNoneTitleIntl = (intl: IntlShape): string => {
    return intl.formatMessage({ id: "gs.filterLabel.none" });
};

export const getItemsTitles = (items: IListItem[], emptyTitle?: string): string => {
    return items
        .map((item) => {
            return !isEmpty(item.title) ? item : emptyTitle;
        })
        .join(", ");
};

export function showAllFilteredMessage(
    isElementsLoading: boolean,
    parentFilters: IAttributeFilter[],
    totalElementsCount: number,
): boolean {
    if (!parentFilters) {
        return false;
    }
    const parentFiltersEmpty = parentFilters.every((filter) => filterIsEmpty(filter));
    return !isElementsLoading && !parentFiltersEmpty && totalElementsCount === 0;
}

export function showItemsFilteredMessage(
    isElementsLoading: boolean,
    parentFilters: IAttributeFilter[],
): boolean {
    if (!parentFilters) {
        return false;
    }
    const parentFiltersNotEmpty = parentFilters.some((filter) => !filterIsEmpty(filter));
    return !isElementsLoading && parentFiltersNotEmpty;
}
