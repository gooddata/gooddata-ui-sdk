// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { idRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

import {
    useDashboardDispatch,
    uiActions,
    useDashboardSelector,
    selectSettings,
    replaceSectionItem,
    useDashboardCommandProcessing,
    selectWidgetPlaceholderCoordinates,
} from "../../../model";
import { INSIGHT_PLACEHOLDER_WIDGET_ID, newInsightPlaceholderWidget } from "../../../widgets";
import { getInsightPlaceholderSizeInfo } from "../../../_staging/layout/sizing";

export function useInsightPlaceholderDropHandler() {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const widgetPlaceholderCoords = useDashboardSelector(selectWidgetPlaceholderCoordinates);

    const { run: replaceInsightOntoPlaceholder } = useDashboardCommandProcessing({
        commandCreator: replaceSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
        onSuccess: () => {
            dispatch(uiActions.selectWidget(idRef(INSIGHT_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(() => {
        const sizeInfo = getInsightPlaceholderSizeInfo(settings);
        invariant(widgetPlaceholderCoords, "cannot drop onto placeholder, there is none");
        replaceInsightOntoPlaceholder(
            widgetPlaceholderCoords.sectionIndex,
            widgetPlaceholderCoords.itemIndex,
            {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridHeight: sizeInfo.height.default!,
                        gridWidth: sizeInfo.width.default!,
                    },
                },
                widget: newInsightPlaceholderWidget(),
            },
        );
    }, [replaceInsightOntoPlaceholder, settings, widgetPlaceholderCoords]);
}
