// (C) 2024 GoodData Corporation

import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { idRef } from "@gooddata/sdk-model";
import { DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";

import {
    addSectionItem,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
} from "../../../model/index.js";

export function useDashboardLayoutPlaceholderDropHandler(sectionIndex: number, itemIndex: number) {
    const dispatch = useDashboardDispatch();

    const { run: createDashboardLayout } = useDashboardCommandProcessing({
        commandCreator: addSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.itemsAdded[0].widget!.ref;
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(() => {
        const id = uuidv4();
        createDashboardLayout(sectionIndex, itemIndex, {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT.height.default!,
                    gridWidth: DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT.width.default!,
                },
            },
            widget: {
                type: "IDashboardLayout",
                sections: [],
                identifier: id,
                ref: idRef(id),
                uri: `/${id}`,
            },
        });
    }, [createDashboardLayout, itemIndex, sectionIndex]);
}
