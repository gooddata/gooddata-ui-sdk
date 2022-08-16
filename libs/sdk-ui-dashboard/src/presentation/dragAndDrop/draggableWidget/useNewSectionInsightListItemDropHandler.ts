// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { IInsight, insightRef, insightTitle } from "@gooddata/sdk-model";

import { getSizeInfo } from "../../../_staging/layout/sizing";
import {
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
    useDashboardCommandProcessing,
    uiActions,
    enableInsightWidgetDateFilter,
    DashboardCommandFailed,
    ChangeInsightWidgetFilterSettings,
    addLayoutSection,
} from "../../../model";

export function useNewSectionInsightListItemDropHandler(sectionIndex: number) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: preselectDateDataset } = useDashboardCommandProcessing({
        commandCreator: enableInsightWidgetDateFilter,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        onSuccess: (event) => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(event.payload.ref));
        },
        onError: (event: DashboardCommandFailed<ChangeInsightWidgetFilterSettings>) => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(event.payload.command.payload.ref));
        },
    });

    const { run: addNewSectionWithInsight } = useDashboardCommandProcessing({
        commandCreator: addLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.section.items[0].widget!.ref;
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
            dispatch(uiActions.setWidgetLoadingAdditionalDataStarted(ref));
            preselectDateDataset(ref, "default");
        },
    });

    return useCallback(
        (insight: IInsight) => {
            const sizeInfo = getSizeInfo(settings, "insight", insight);
            addNewSectionWithInsight(sectionIndex, {}, [
                {
                    type: "IDashboardLayoutItem",
                    widget: {
                        type: "insight",
                        insight: insightRef(insight),
                        ignoreDashboardFilters: [],
                        drills: [],
                        title: insightTitle(insight),
                        description: "",
                        configuration: { hideTitle: false },
                        properties: {},
                    },
                    size: {
                        xl: {
                            gridHeight: sizeInfo.height.default,
                            gridWidth: sizeInfo.width.default!,
                        },
                    },
                },
            ]);
        },
        [addNewSectionWithInsight, sectionIndex, settings],
    );
}
