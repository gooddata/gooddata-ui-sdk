// (C) 2024 GoodData Corporation

import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { idRef } from "@gooddata/sdk-model";
import { DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";

import {
    useDashboardDispatch,
    useDashboardCommandProcessing,
    uiActions,
    addLayoutSection,
} from "../../../model/index.js";

export function useNewSectionDashboardLayoutPlaceholderDropHandler(sectionIndex: number) {
    const dispatch = useDashboardDispatch();

    const { run: addNewSectionWithDashboardLayoutPlaceholder } = useDashboardCommandProcessing({
        commandCreator: addLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.section.items[0].widget!.ref;
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(() => {
        const id = uuidv4();
        addNewSectionWithDashboardLayoutPlaceholder(sectionIndex, {}, [
            {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridHeight: DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT.height.default!,
                        gridWidth: DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT.width.default!,
                    },
                },
                widget: {
                    type: "IDashboardLayout",
                    identifier: id,
                    sections: [],
                    ref: idRef(id),
                    uri: `/${id}`,
                    size: {
                        //TODO INE - duplicate size info
                        gridHeight: DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT.height.default!,
                        gridWidth: DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT.width.default!,
                    },
                },
            },
        ]);
    }, [addNewSectionWithDashboardLayoutPlaceholder, sectionIndex]);
}
