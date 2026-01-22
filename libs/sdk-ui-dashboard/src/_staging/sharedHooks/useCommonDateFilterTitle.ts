// (C) 2024-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectDateFilterConfigOverrides } from "../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";

export const useCommonDateFilterTitle = (intl: IntlShape) => {
    const filterConfig = useDashboardSelector(selectDateFilterConfigOverrides);

    return filterConfig?.filterName ?? intl.formatMessage({ id: "dateFilterDropdown.title" });
};
