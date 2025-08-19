// (C) 2024-2025 GoodData Corporation

import { IntlShape } from "react-intl";

import { IDashboardDateFilter, areObjRefsEqual, serializeObjRef } from "@gooddata/sdk-model";

import {
    selectCatalogDateDatasets,
    selectDateFilterConfigsOverrides,
    useDashboardSelector,
} from "../../model/index.js";

export const useDateFiltersTitles = (filters: IDashboardDateFilter[], intl: IntlShape) => {
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const allDateOverrides = useDashboardSelector(selectDateFilterConfigsOverrides);

    return filters.reduce(
        (acc, filter) => {
            if (!filter.dateFilter.dataSet) {
                return acc;
            }
            const key = serializeObjRef(filter.dateFilter.dataSet);

            const customFilterName = allDateOverrides.find((config) =>
                areObjRefsEqual(config.dateDataSet, filter.dateFilter.dataSet),
            )?.config?.filterName;
            const dateDataSetName = allDateDatasets.find((ds) =>
                areObjRefsEqual(ds.dataSet.ref, filter?.dateFilter.dataSet),
            )?.dataSet?.title;

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
