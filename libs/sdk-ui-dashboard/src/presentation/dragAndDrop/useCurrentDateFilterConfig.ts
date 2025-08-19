// (C) 2023-2025 GoodData Corporation
import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import {
    selectDateFilterConfigOverrides,
    selectDateFilterConfigsOverrides,
    useDashboardSelector,
} from "../../model/index.js";

export const useCurrentDateFilterConfig = (
    dateDataSet: ObjRef | undefined,
    defaultDateFilterTitle: string,
) => {
    const filterConfig = useDashboardSelector(selectDateFilterConfigOverrides);
    const filterConfigByDimension = useDashboardSelector(selectDateFilterConfigsOverrides);

    const usedConfig = dateDataSet
        ? filterConfigByDimension.find((config) => areObjRefsEqual(config.dateDataSet, dateDataSet))?.config
        : filterConfig;

    const originalTitle =
        !usedConfig || usedConfig?.filterName === "" ? defaultDateFilterTitle : usedConfig?.filterName;

    return {
        mode: usedConfig?.mode ?? "active",
        title: originalTitle,
    };
};
