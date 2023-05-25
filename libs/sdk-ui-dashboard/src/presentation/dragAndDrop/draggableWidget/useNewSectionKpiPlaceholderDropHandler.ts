// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { idRef } from "@gooddata/sdk-model";

import { getSizeInfo } from "../../../_staging/layout/sizing.js";
import {
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
    useDashboardCommandProcessing,
    uiActions,
    addLayoutSection,
} from "../../../model/index.js";
import { KPI_PLACEHOLDER_WIDGET_ID, newKpiPlaceholderWidget } from "../../../widgets/index.js";

export function useNewSectionKpiPlaceholderDropHandler(sectionIndex: number) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: addNewSectionWithKpiPlaceholder } = useDashboardCommandProcessing({
        commandCreator: addLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.section.items[0].widget!.ref;
            dispatch(uiActions.selectWidget(idRef(KPI_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
            dispatch(uiActions.setWidgetDateDatasetAutoSelect(true));
            dispatch(uiActions.setWidgetLoadingAdditionalDataStarted(ref));
        },
    });

    return useCallback(() => {
        const sizeInfo = getSizeInfo(settings, "kpi");
        addNewSectionWithKpiPlaceholder(sectionIndex, {}, [
            {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridHeight: sizeInfo.height.default!,
                        gridWidth: sizeInfo.width.default!,
                    },
                },
                widget: newKpiPlaceholderWidget(),
            },
        ]);
    }, [addNewSectionWithKpiPlaceholder, sectionIndex, settings]);
}
