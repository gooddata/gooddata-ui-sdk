// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";
import {
    useDashboardDispatch,
    useDashboardCommandProcessing,
    uiActions,
    addNestedLayoutSection,
    enableRichTextWidgetDateFilter,
    DashboardCommandFailed,
    ChangeInsightWidgetFilterSettings,
} from "../../../../model/index.js";
import { idRef } from "@gooddata/sdk-model";
import { v4 as uuidv4 } from "uuid";
import { ILayoutSectionPath } from "../../../../types.js";
import { BaseDraggableLayoutItemSize } from "../../../dragAndDrop/index.js";

export function useNewSectionRichTextPlaceholderDropHandler(sectionIndex: ILayoutSectionPath) {
    const dispatch = useDashboardDispatch();

    const { run: preselectDateDataset } = useDashboardCommandProcessing({
        commandCreator: enableRichTextWidgetDateFilter,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED",
        onSuccess: (event) => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(event.payload.ref));
        },
        onError: (event: DashboardCommandFailed<ChangeInsightWidgetFilterSettings>) => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(event.payload.command.payload.ref));
        },
    });

    const { run: addNewSectionWithRichText } = useDashboardCommandProcessing({
        commandCreator: addNestedLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.section.items[0].widget!.ref;
            preselectDateDataset(ref, "default");
            dispatch(uiActions.selectWidget(ref));
        },
    });

    return useCallback(
        (itemSize: BaseDraggableLayoutItemSize) => {
            const id = uuidv4();

            addNewSectionWithRichText(sectionIndex, {}, [
                {
                    type: "IDashboardLayoutItem",
                    size: {
                        xl: {
                            gridHeight: itemSize.gridHeight,
                            gridWidth: itemSize.gridWidth,
                        },
                    },
                    widget: {
                        type: "richText",
                        description: "",
                        content: "",
                        drills: [],
                        ignoreDashboardFilters: [],
                        title: "",
                        identifier: id,
                        ref: idRef(id),
                        uri: `/${id}`,
                    },
                },
            ]);
        },
        [addNewSectionWithRichText, sectionIndex],
    );
}
