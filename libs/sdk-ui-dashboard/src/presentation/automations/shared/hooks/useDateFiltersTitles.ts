// (C) 2024-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type IDashboardDateFilter, areObjRefsEqual, serializeObjRef } from "@gooddata/sdk-model";

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";

export const useDateFiltersTitles = (filters: IDashboardDateFilter[], intl: IntlShape) => {
    const { catalogDateDatasets: allDateDatasets, dateFilterConfigs: allDateOverrides } =
        useAutomationsContext();

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
