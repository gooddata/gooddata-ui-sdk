// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";

import { idRef } from "@gooddata/sdk-model";

import { getInsightPlaceholderSizeInfo } from "../../../../_staging/layout/sizing.js";
import {
    addSectionItem,
    selectSettings,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { INSIGHT_PLACEHOLDER_WIDGET_ID, newInsightPlaceholderWidget } from "../../../../widgets/index.js";

export function useInsightPlaceholderDropHandler(sectionIndex: number, itemIndex: number) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: replaceInsightOntoPlaceholder } = useDashboardCommandProcessing({
        commandCreator: addSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        onSuccess: () => {
            dispatch(uiActions.selectWidget(idRef(INSIGHT_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(() => {
        const sizeInfo = getInsightPlaceholderSizeInfo(settings);
        replaceInsightOntoPlaceholder(sectionIndex, itemIndex, {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: sizeInfo.height.default!,
                    gridWidth: sizeInfo.width.default!,
                },
            },
            widget: newInsightPlaceholderWidget(),
        });
    }, [itemIndex, replaceInsightOntoPlaceholder, sectionIndex, settings]);
}
