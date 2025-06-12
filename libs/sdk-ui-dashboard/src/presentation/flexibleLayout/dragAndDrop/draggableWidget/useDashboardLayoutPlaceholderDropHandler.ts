// (C) 2024 GoodData Corporation

import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { idRef } from "@gooddata/sdk-model";
import { ILayoutItemPath } from "../../../../types.js";
import {
    useDashboardDispatch,
    useDashboardCommandProcessing,
    addNestedLayoutSectionItem,
    uiActions,
} from "../../../../model/index.js";
import { BaseDraggableLayoutItemSize } from "../../../dragAndDrop/index.js";

export function useDashboardLayoutPlaceholderDropHandler(layoutPath: ILayoutItemPath) {
    const dispatch = useDashboardDispatch();

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
        (itemSize: BaseDraggableLayoutItemSize) => {
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
                        sections: {
                            enableHeader: false,
                        },
                    },
                },
            });
        },
        [createDashboardLayout, layoutPath],
    );
}
