// (C) 2024-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type DashboardDateFilterOfAnyType,
    areObjRefsEqual,
    dashboardFilterObjRef,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectCatalogDateDatasets } from "../../model/store/catalog/catalogSelectors.js";
import { selectDateFilterConfigsOverrides } from "../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";

export const useDateFiltersTitles = (filters: DashboardDateFilterOfAnyType[], intl: IntlShape) => {
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const allDateOverrides = useDashboardSelector(selectDateFilterConfigsOverrides);

    return filters.reduce(
        (acc, filter) => {
            const dataSet = dashboardFilterObjRef(filter);
            if (!dataSet) {
                return acc;
            }
            const key = serializeObjRef(dataSet);

            const customFilterName = allDateOverrides.find((config) =>
                areObjRefsEqual(config.dateDataSet, dataSet),
            )?.config?.filterName;
            const dateDataSetName = allDateDatasets.find((ds) => areObjRefsEqual(ds.dataSet.ref, dataSet))
                ?.dataSet?.title;

            const title =
                customFilterName || dateDataSetName || intl.formatMessage({ id: "dateFilterDropdown.title" });

            if (title) {
                acc[key] = title;
            }

            return acc;
        },
        {} as Record<string, string>,
    );
};
