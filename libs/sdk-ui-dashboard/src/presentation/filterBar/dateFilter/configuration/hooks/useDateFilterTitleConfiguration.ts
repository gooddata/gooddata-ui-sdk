// (C) 2023-2025 GoodData Corporation
import { useCallback, useState } from "react";

import { type ObjRef } from "@gooddata/sdk-model";

import {
    setDateFilterConfigTitle,
    useDashboardCommandProcessing,
    useDashboardUserInteraction,
} from "../../../../../model/index.js";
import { useCurrentDateFilterConfig } from "../../../../dragAndDrop/index.js";

export function useDateFilterTitleConfiguration(
    dateDataSet: ObjRef | undefined,
    defaultDateFilterTitle: string,
) {
    const { run: changeTitle, status: titleChangeStatus } = useDashboardCommandProcessing({
        commandCreator: setDateFilterConfigTitle,
        successEvent: "GDC.DASH/EVT.DATE_FILTER_CONFIG.TITLE_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const userInteraction = useDashboardUserInteraction();

    const { title: originalTitle } = useCurrentDateFilterConfig(dateDataSet, defaultDateFilterTitle);

    const [title, setTitle] = useState<string | undefined>(originalTitle);

    const titleChanged = originalTitle !== title;

    const onTitleUpdate = useCallback((value: string) => {
        setTitle(value);
    }, []);

    const onTitleChange = useCallback(() => {
        if (titleChanged) {
            const updatedTitle = title === defaultDateFilterTitle ? undefined : title?.trim();
            changeTitle(dateDataSet, updatedTitle);
        }
    }, [title, dateDataSet, defaultDateFilterTitle, changeTitle, titleChanged]);

    const onTitleReset = useCallback(() => {
        setTitle(undefined);
        userInteraction.dateFilterInteraction("dateFilterTitleResetClicked");
    }, [userInteraction]);

    const onConfigurationClose = useCallback(() => {
        setTitle(originalTitle);
    }, [originalTitle]);

    return {
        title,
        titleChanged,
        titleChangeStatus,
        onTitleChange,
        onTitleUpdate,
        onTitleReset,
        onConfigurationClose,
    };
}
