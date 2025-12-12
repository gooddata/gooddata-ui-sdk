// (C) 2023-2025 GoodData Corporation
import { type DashboardDateFilterConfigMode, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { useDateFilterTitleConfiguration } from "./configuration/hooks/useDateFilterTitleConfiguration.js";
import {
    selectDateFilterConfigOverrides,
    selectDateFilterConfigsOverrides,
    setDashboardDateFilterConfigMode,
    setDashboardDateFilterWithDimensionConfigMode,
    useDashboardSelector,
    useDispatchDashboardCommand,
} from "../../../model/index.js";

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
