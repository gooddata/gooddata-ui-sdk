// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";

import { idRef } from "@gooddata/sdk-model";

import { useUpdateWidgetDefaultSizeByParent } from "./useUpdateWidgetDefaultSizeByParent.js";
import { getInsightPlaceholderSizeInfo } from "../../../../_staging/layout/sizing.js";
import {
    addNestedLayoutSectionItem,
    selectSettings,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { type ILayoutItemPath } from "../../../../types.js";
import { INSIGHT_PLACEHOLDER_WIDGET_ID, newInsightPlaceholderWidget } from "../../../../widgets/index.js";

export function useInsightPlaceholderDropHandler(layoutPath: ILayoutItemPath) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const updateWidgetDefaultSizeByParent = useUpdateWidgetDefaultSizeByParent(layoutPath);

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
        const defaultItemSize = getInsightPlaceholderSizeInfo(settings);
        const itemSize = updateWidgetDefaultSizeByParent(defaultItemSize);
        replaceInsightOntoPlaceholder(layoutPath, {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: itemSize.height.default!,
                    gridWidth: itemSize.width.default!,
                },
            },
            widget: newInsightPlaceholderWidget(),
        });
    }, [replaceInsightOntoPlaceholder, layoutPath, settings, updateWidgetDefaultSizeByParent]);
}
