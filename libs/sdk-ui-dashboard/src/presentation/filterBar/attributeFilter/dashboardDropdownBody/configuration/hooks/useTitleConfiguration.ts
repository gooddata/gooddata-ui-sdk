// (C) 2023 GoodData Corporation
import { useState, useCallback } from "react";
import { IDashboardAttributeFilter } from "@gooddata/sdk-model";

import {
    setAttributeFilterTitle,
    useDashboardCommandProcessing,
    useDashboardUserInteraction,
} from "../../../../../../model/index.js";

export function useTitleConfiguration(
    currentFilter: IDashboardAttributeFilter,
    defaultAttributeFilterTitle?: string,
) {
    const { run: changeTitle, status: titleChangeStatus } = useDashboardCommandProcessing({
        commandCreator: setAttributeFilterTitle,
        successEvent: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.TITLE_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const userInteraction = useDashboardUserInteraction();

    const originalTitle = currentFilter.attributeFilter.title ?? defaultAttributeFilterTitle;

    const [title, setTitle] = useState<string | undefined>(originalTitle);

    const titleChanged = originalTitle !== title;

    const onTitleUpdate = useCallback((value: string) => {
        setTitle(value);
    }, []);

    const onTitleChange = useCallback(() => {
        if (title !== originalTitle) {
            const updatedTitle = title !== defaultAttributeFilterTitle ? title?.trim() : undefined;
            changeTitle(currentFilter.attributeFilter.localIdentifier!, updatedTitle);
        }
    }, [title, currentFilter, defaultAttributeFilterTitle, changeTitle]);

    const onTitleReset = useCallback(() => {
        setTitle(undefined);
        userInteraction.attributeFilterTitleResetClicked();
    }, []);

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
