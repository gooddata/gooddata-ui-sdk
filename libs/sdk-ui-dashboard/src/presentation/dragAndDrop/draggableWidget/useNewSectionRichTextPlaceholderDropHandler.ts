// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";
import { getInsightPlaceholderSizeInfo } from "../../../_staging/layout/sizing.js";
import {
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
    useDashboardCommandProcessing,
    uiActions,
    addLayoutSection,
} from "../../../model/index.js";
import { idRef } from "@gooddata/sdk-model";
import { v4 as uuidv4 } from "uuid";

export function useNewSectionRichTextPlaceholderDropHandler(sectionIndex: number) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: addNewSectionWithRichText } = useDashboardCommandProcessing({
        commandCreator: addLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.section.items[0].widget!.ref;
            dispatch(uiActions.selectWidget(ref));
        },
    });

    return useCallback(() => {
        const id = uuidv4();
        const sizeInfo = getInsightPlaceholderSizeInfo(settings); // TODO: RICH TEXT sizing
        addNewSectionWithRichText(sectionIndex, {}, [
            {
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
            },
        ]);
    }, [addNewSectionWithRichText, sectionIndex, settings]);
}
