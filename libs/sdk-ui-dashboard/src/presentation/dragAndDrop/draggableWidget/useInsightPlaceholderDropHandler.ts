// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { idRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

import {
    useDashboardDispatch,
    uiActions,
    useDashboardSelector,
    selectSettings,
    selectWidgetPlaceholder,
    replaceSectionItem,
    useDashboardCommandProcessing,
} from "../../../model";
import { INSIGHT_PLACEHOLDER_WIDGET_ID, newInsightPlaceholderWidget } from "../../../widgets";
import { getInsightPlaceholderSizeInfo } from "../../../_staging/layout/sizing";

export function useInsightPlaceholderDropHandler() {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const widgetPlaceholder = useDashboardSelector(selectWidgetPlaceholder);

    const { run: replaceInsightOntoPlaceholder } = useDashboardCommandProcessing({
        commandCreator: replaceSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
        onSuccess: () => {
            dispatch(uiActions.selectWidget(idRef(INSIGHT_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(
        (sectionIndex: number, itemIndex: number, isLastInSection: boolean) => {
            const sizeInfo = getInsightPlaceholderSizeInfo(settings);
            invariant(widgetPlaceholder, "cannot drop onto placeholder, there is none");
            replaceInsightOntoPlaceholder(widgetPlaceholder.sectionIndex, widgetPlaceholder.itemIndex, {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridHeight: sizeInfo.height.default!,
                        gridWidth: sizeInfo.width.default!,
                    },
                },
                widget: newInsightPlaceholderWidget(sectionIndex, itemIndex, isLastInSection),
            });
        },
        [replaceInsightOntoPlaceholder, settings, widgetPlaceholder],
    );
}
