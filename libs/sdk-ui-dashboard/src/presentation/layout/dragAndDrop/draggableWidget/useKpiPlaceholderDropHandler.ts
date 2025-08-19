// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";

import { idRef } from "@gooddata/sdk-model";

import { getSizeInfo } from "../../../../_staging/layout/sizing.js";
import {
    addSectionItem,
    selectSettings,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { KPI_PLACEHOLDER_WIDGET_ID, newKpiPlaceholderWidget } from "../../../../widgets/index.js";

export function useKpiPlaceholderDropHandler(sectionIndex: number, itemIndex: number) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: createKpi } = useDashboardCommandProcessing({
        commandCreator: addSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.itemsAdded[0].widget!.ref;
            dispatch(uiActions.selectWidget(idRef(KPI_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
            dispatch(uiActions.setWidgetDateDatasetAutoSelect(true));
            dispatch(uiActions.setWidgetLoadingAdditionalDataStarted(ref));
        },
    });

    return useCallback(() => {
        const sizeInfo = getSizeInfo(settings, "kpi");
        createKpi(sectionIndex, itemIndex, {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: sizeInfo.height.default!,
                    gridWidth: sizeInfo.width.default!,
                },
            },
            widget: newKpiPlaceholderWidget(),
        });
    }, [createKpi, itemIndex, sectionIndex, settings]);
}
