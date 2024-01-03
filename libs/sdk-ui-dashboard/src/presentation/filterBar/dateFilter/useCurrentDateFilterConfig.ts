// (C) 2023 GoodData Corporation
import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    selectDateFilterConfigOverrides,
    useDashboardSelector,
    selectDateFilterConfigsOverrides,
    selectEffectiveDateFilterTitle,
} from "../../../model/index.js";

export const useCurrentDateFilterConfig = (
    dateDataSet: ObjRef | undefined,
    defaultDateFilterTitle: string,
) => {
    const filterConfig = useDashboardSelector(selectDateFilterConfigOverrides);
    const filterConfigByDimension = useDashboardSelector(selectDateFilterConfigsOverrides);

    const customCommonDateFilterTitle = useDashboardSelector(selectEffectiveDateFilterTitle);

    let originalTitle: string;

    const usedConfig = dateDataSet
        ? filterConfigByDimension.find((config) => areObjRefsEqual(config.dateDataSet, dateDataSet))?.config
        : filterConfig;

    if (dateDataSet) {
        originalTitle =
            !usedConfig || usedConfig?.filterName === "" ? defaultDateFilterTitle : usedConfig?.filterName;
    } else {
        originalTitle = customCommonDateFilterTitle ?? defaultDateFilterTitle;
    }

    return {
        mode: usedConfig?.mode ?? "active",
        title: originalTitle,
    };
};
