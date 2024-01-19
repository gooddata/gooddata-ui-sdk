// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";

import {
    addSectionItem,
    selectSettings,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
import { getSizeInfo } from "../../../_staging/layout/sizing.js";
import { idRef } from "@gooddata/sdk-model";
import { v4 as uuidv4 } from "uuid";

export function useRichTextPlaceholderDropHandler(sectionIndex: number, itemIndex: number) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: createRichText } = useDashboardCommandProcessing({
        commandCreator: addSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.itemsAdded[0].widget!.ref;
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
