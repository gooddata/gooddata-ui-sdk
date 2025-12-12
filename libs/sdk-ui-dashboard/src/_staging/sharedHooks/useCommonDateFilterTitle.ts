// (C) 2024 GoodData Corporation

import { type IntlShape } from "react-intl";

import { selectDateFilterConfigOverrides, useDashboardSelector } from "../../model/index.js";

export const useCommonDateFilterTitle = (intl: IntlShape) => {
    const filterConfig = useDashboardSelector(selectDateFilterConfigOverrides);

    return filterConfig?.filterName ?? intl.formatMessage({ id: "dateFilterDropdown.title" });
};
