// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";
import {
    useDashboardDispatch,
    useDashboardCommandProcessing,
    uiActions,
    addLayoutSection,
} from "../../../model/index.js";
import { idRef } from "@gooddata/sdk-model";
import { v4 as uuidv4 } from "uuid";
import { RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";

export function useNewSectionRichTextPlaceholderDropHandler(sectionIndex: number) {
    const dispatch = useDashboardDispatch();

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
        addNewSectionWithRichText(sectionIndex, {}, [
            {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridHeight: RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT.height.default!,
                        gridWidth: RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT.width.default!,
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
    }, [addNewSectionWithRichText, sectionIndex]);
}
