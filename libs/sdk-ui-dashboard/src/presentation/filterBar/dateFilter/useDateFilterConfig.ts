// (C) 2023-2026 GoodData Corporation

import { type DashboardDateFilterConfigMode, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { useDateFilterTitleConfiguration } from "./configuration/hooks/useDateFilterTitleConfiguration.js";
import {
    setDashboardDateFilterConfigMode,
    setDashboardDateFilterWithDimensionConfigMode,
} from "../../../model/commands/dashboard.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDispatchDashboardCommand } from "../../../model/react/useDispatchDashboardCommand.js";
import { selectDateFilterConfigOverrides } from "../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectDateFilterConfigsOverrides } from "../../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";

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
