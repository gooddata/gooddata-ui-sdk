// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";
import { idRef } from "@gooddata/sdk-model";
import { v4 as uuidv4 } from "uuid";

import {
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
    useDashboardCommandProcessing,
    uiActions,
    addLayoutSection,
} from "../../../model/index.js";
import { KPI_PLACEHOLDER_WIDGET_ID } from "../../../widgets/index.js";
import { STACK_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";

export function useNewSectionStackPlaceholderDropHandler(sectionIndex: number) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: addNewSectionWithStackPlaceholder } = useDashboardCommandProcessing({
        commandCreator: addLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.section.items[0].widget!.ref;
            dispatch(uiActions.selectWidget(idRef(KPI_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
            dispatch(uiActions.setWidgetDateDatasetAutoSelect(true));
            dispatch(uiActions.setWidgetLoadingAdditionalDataStarted(ref));
        },
    });

    return useCallback(() => {
        const id = uuidv4();
        addNewSectionWithStackPlaceholder(sectionIndex, {}, [
            {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridHeight: STACK_WIDGET_SIZE_INFO_DEFAULT.height.default!,
                        gridWidth: STACK_WIDGET_SIZE_INFO_DEFAULT.width.default!,
                    },
                },
                widget: {
                    type: "stack",
                    insights: [],
                    description: "",
                    drills: [],
                    ignoreDashboardFilters: [],
                    title: "",
                    identifier: id,
                    ref: idRef(id),
                    uri: `/${id}`,
                },
            },
        ]);
    }, [addNewSectionWithStackPlaceholder, sectionIndex, settings]);
}
