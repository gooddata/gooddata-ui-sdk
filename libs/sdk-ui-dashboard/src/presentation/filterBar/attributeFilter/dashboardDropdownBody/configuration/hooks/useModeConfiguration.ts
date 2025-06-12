// (C) 2023 GoodData Corporation
import { useState, useCallback } from "react";
import { DashboardAttributeFilterConfigMode, IDashboardAttributeFilter } from "@gooddata/sdk-model";

import {
    selectAttributeFilterConfigsOverrides,
    useDashboardCommandProcessing,
    useDashboardSelector,
    setDashboardAttributeFilterConfigMode,
} from "../../../../../../model/index.js";

export function useModeConfiguration(
    currentFilter: IDashboardAttributeFilter,
    defaultAttributeFilterMode?: DashboardAttributeFilterConfigMode,
) {
    const { run: changeAttributeMode } = useDashboardCommandProcessing({
        commandCreator: setDashboardAttributeFilterConfigMode,
        successEvent: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.MODE_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const currentFilterConfig = useDashboardSelector(selectAttributeFilterConfigsOverrides).find(
        (item) => item.localIdentifier === currentFilter.attributeFilter.localIdentifier,
    );
    const currentFilterLocalId =
        currentFilterConfig?.localIdentifier || currentFilter?.attributeFilter.localIdentifier;
    const originalMode = currentFilterConfig?.mode ?? defaultAttributeFilterMode;

    const [mode, setMode] = useState<DashboardAttributeFilterConfigMode | undefined>(originalMode);

    const modeChanged = originalMode !== mode;

    const onModeUpdate = useCallback((value: DashboardAttributeFilterConfigMode) => {
        setMode(value);
    }, []);

    const onModeChange = useCallback(() => {
        if (mode !== originalMode) {
            changeAttributeMode(currentFilterLocalId as string, mode);
        }
    }, [currentFilterLocalId, originalMode, changeAttributeMode, mode]);

    const onConfigurationClose = useCallback(() => {
        setMode(originalMode);
    }, [originalMode]);

    return {
        mode,
        modeChanged,
        onModeUpdate,
        onModeChange,
        onConfigurationClose,
    };
}
