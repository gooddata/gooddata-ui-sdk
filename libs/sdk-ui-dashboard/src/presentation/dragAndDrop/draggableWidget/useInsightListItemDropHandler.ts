// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { IInsight, insightRef, insightTitle } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

import {
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
    useDashboardCommandProcessing,
    uiActions,
    replaceSectionItem,
    enableInsightWidgetDateFilter,
    DashboardCommandFailed,
    ChangeInsightWidgetFilterSettings,
    selectWidgetPlaceholderCoordinates,
} from "../../../model";
import { getSizeInfo } from "../../../_staging/layout/sizing";

export function useInsightListItemDropHandler() {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const widgetPlaceholderCoords = useDashboardSelector(selectWidgetPlaceholderCoordinates);

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

    const { run: replaceInsightOntoPlaceholder } = useDashboardCommandProcessing({
        commandCreator: replaceSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
        onSuccess: (event) => {
            const ref = event.payload.items[0].widget!.ref;
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
            dispatch(uiActions.setWidgetLoadingAdditionalDataStarted(ref));
            preselectDateDataset(ref, "default");
        },
    });

    return useCallback(
        (insight: IInsight) => {
            invariant(widgetPlaceholderCoords, "cannot drop onto placeholder, there is none");

            const sizeInfo = getSizeInfo(settings, "insight", insight);
            replaceInsightOntoPlaceholder(
                widgetPlaceholderCoords.sectionIndex,
                widgetPlaceholderCoords.itemIndex,
                {
                    type: "IDashboardLayoutItem",
                    widget: {
                        type: "insight",
                        insight: insightRef(insight),
                        ignoreDashboardFilters: [],
                        drills: [],
                        title: insightTitle(insight),
                        description: "",
                    },
                    size: {
                        xl: {
                            gridHeight: sizeInfo.height.default,
                            gridWidth: sizeInfo.width.default!,
                        },
                    },
                },
            );
        },
        [replaceInsightOntoPlaceholder, settings, widgetPlaceholderCoords],
    );
}
