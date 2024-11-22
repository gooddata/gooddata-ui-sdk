// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";
import { idRef } from "@gooddata/sdk-model";

import {
    useDashboardDispatch,
    uiActions,
    useDashboardSelector,
    selectSettings,
    useDashboardCommandProcessing,
    addNestedLayoutSectionItem,
} from "../../../../model/index.js";
import { INSIGHT_PLACEHOLDER_WIDGET_ID, newInsightPlaceholderWidget } from "../../../../widgets/index.js";
import { getInsightPlaceholderSizeInfo } from "../../../../_staging/layout/sizing.js";
import { ILayoutItemPath } from "../../../../types.js";

export function useInsightPlaceholderDropHandler(layoutPath: ILayoutItemPath) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: replaceInsightOntoPlaceholder } = useDashboardCommandProcessing({
        commandCreator: addNestedLayoutSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        onSuccess: () => {
            dispatch(uiActions.selectWidget(idRef(INSIGHT_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(() => {
        const sizeInfo = getInsightPlaceholderSizeInfo(settings);
        replaceInsightOntoPlaceholder(layoutPath, {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: sizeInfo.height.default!,
                    gridWidth: sizeInfo.width.default!,
                },
            },
            widget: newInsightPlaceholderWidget(),
        });
    }, [replaceInsightOntoPlaceholder, layoutPath, settings]);
}
