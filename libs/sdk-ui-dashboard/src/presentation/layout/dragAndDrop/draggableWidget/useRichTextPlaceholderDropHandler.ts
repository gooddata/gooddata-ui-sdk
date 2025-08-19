// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";

import { v4 as uuidv4 } from "uuid";

import { idRef } from "@gooddata/sdk-model";

import { getSizeInfo } from "../../../../_staging/layout/sizing.js";
import {
    ChangeInsightWidgetFilterSettings,
    DashboardCommandFailed,
    addSectionItem,
    enableRichTextWidgetDateFilter,
    selectSettings,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";

export function useRichTextPlaceholderDropHandler(sectionIndex: number, itemIndex: number) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

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

    const { run: createRichText } = useDashboardCommandProcessing({
        commandCreator: addSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.itemsAdded[0].widget!.ref;
            preselectDateDataset(ref, "default");
            dispatch(uiActions.selectWidget(ref));
        },
    });

    return useCallback(() => {
        const id = uuidv4();
        const sizeInfo = getSizeInfo(settings, "richText");
        createRichText(sectionIndex, itemIndex, {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: sizeInfo.height.default!,
                    gridWidth: sizeInfo.width.default!,
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
        });
    }, [createRichText, itemIndex, sectionIndex, settings]);
}
