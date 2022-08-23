// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { idRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

import {
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
    uiActions,
    replaceSectionItem,
    useDashboardCommandProcessing,
    selectWidgetPlaceholderCoordinates,
} from "../../../model";
import { getSizeInfo } from "../../../_staging/layout/sizing";
import { KPI_PLACEHOLDER_WIDGET_ID, newKpiPlaceholderWidget } from "../../../widgets";

export function useKpiPlaceholderDropHandler() {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const widgetPlaceholderCoords = useDashboardSelector(selectWidgetPlaceholderCoordinates);

    const { run: replaceKpiOntoPlaceholder } = useDashboardCommandProcessing({
        commandCreator: replaceSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
        onSuccess: (event) => {
            const ref = event.payload.items[0].widget!.ref;
            dispatch(uiActions.selectWidget(idRef(KPI_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
            dispatch(uiActions.setKpiDateDatasetAutoOpen(true));
            dispatch(uiActions.setWidgetLoadingAdditionalDataStarted(ref));
        },
    });

    return useCallback(() => {
        const sizeInfo = getSizeInfo(settings, "kpi");
        invariant(widgetPlaceholderCoords, "cannot drop onto placeholder, there is none");
        replaceKpiOntoPlaceholder(widgetPlaceholderCoords.sectionIndex, widgetPlaceholderCoords.itemIndex, {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: sizeInfo.height.default!,
                    gridWidth: sizeInfo.width.default!,
                },
            },
            widget: newKpiPlaceholderWidget(),
        });
    }, [replaceKpiOntoPlaceholder, settings, widgetPlaceholderCoords]);
}
