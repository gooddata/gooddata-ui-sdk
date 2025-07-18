// (C) 2023-2025 GoodData Corporation
import { DashboardDateFilterConfigMode, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    selectDateFilterConfigOverrides,
    useDashboardSelector,
    selectDateFilterConfigsOverrides,
    useDispatchDashboardCommand,
    setDashboardDateFilterConfigMode,
    setDashboardDateFilterWithDimensionConfigMode,
} from "../../../model/index.js";

import { useDateFilterTitleConfiguration } from "./configuration/hooks/useDateFilterTitleConfiguration.js";

export const useDateFilterConfig = (dateDataSet: ObjRef | undefined, defaultDateFilterTitle: string) => {
    const filterConfig = useDashboardSelector(selectDateFilterConfigOverrides);
    const filterConfigByDimension = useDashboardSelector(selectDateFilterConfigsOverrides);

    const changeConfigMode = useDispatchDashboardCommand(setDashboardDateFilterConfigMode);

    const changeConfigModeForDimension = useDispatchDashboardCommand(
        setDashboardDateFilterWithDimensionConfigMode,
    );

    const { title, titleChanged, onTitleChange, onTitleUpdate, onTitleReset, onConfigurationClose } =
        useDateFilterTitleConfiguration(dateDataSet, defaultDateFilterTitle);

    const usedConfig = dateDataSet
        ? filterConfigByDimension.find((config) => areObjRefsEqual(config.dateDataSet, dateDataSet))?.config
        : filterConfig;

    return {
        mode: usedConfig?.mode ?? "active",
        changeConfigMode: (mode: DashboardDateFilterConfigMode) => {
            if (dateDataSet) {
                changeConfigModeForDimension(dateDataSet, mode);
            } else {
                changeConfigMode(mode);
            }
        },
        title,
        titleChanged,
        onTitleChange,
        onTitleUpdate,
        onTitleReset,
        onConfigurationClose,
    };
};
