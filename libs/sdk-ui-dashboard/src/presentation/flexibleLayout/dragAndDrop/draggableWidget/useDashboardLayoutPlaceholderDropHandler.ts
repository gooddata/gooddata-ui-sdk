// (C) 2024-2025 GoodData Corporation

import { useCallback } from "react";

import { v4 as uuidv4 } from "uuid";

import { idRef } from "@gooddata/sdk-model";

import { useUpdateWidgetDefaultSizeByParent } from "./useUpdateWidgetDefaultSizeByParent.js";
import {
    addNestedLayoutSectionItem,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
} from "../../../../model/index.js";
import { type ILayoutItemPath } from "../../../../types.js";
import { type BaseDraggableLayoutItemSize } from "../../../dragAndDrop/index.js";

export function useDashboardLayoutPlaceholderDropHandler(layoutPath: ILayoutItemPath) {
    const dispatch = useDashboardDispatch();
    const updateWidgetDefaultSizeByParent = useUpdateWidgetDefaultSizeByParent(layoutPath);

    const { run: createDashboardLayout } = useDashboardCommandProcessing({
        commandCreator: addNestedLayoutSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.itemsAdded[0].widget!.ref;
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(
        (defaultItemSize: BaseDraggableLayoutItemSize) => {
            const itemSize = updateWidgetDefaultSizeByParent(defaultItemSize);
            const id = uuidv4();
            createDashboardLayout(layoutPath, {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridHeight: itemSize.gridHeight,
                        gridWidth: itemSize.gridWidth,
                    },
                },
                widget: {
                    type: "IDashboardLayout",
                    sections: [],
                    identifier: id,
                    ref: idRef(id),
                    uri: `/${id}`,
                    configuration: {
                        direction: "column",
                        sections: {
                            enableHeader: false,
                        },
                    },
                },
            });
        },
        [createDashboardLayout, layoutPath, updateWidgetDefaultSizeByParent],
    );
}
