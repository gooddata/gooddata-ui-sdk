// (C) 2023 GoodData Corporation
import { useState, useCallback } from "react";
import { IDashboardAttributeFilter } from "@gooddata/sdk-model";

import { setAttributeFilterTitle, useDashboardCommandProcessing } from "../../../../../../model";

export function useTitleConfiguration(
    currentFilter: IDashboardAttributeFilter,
    defaultAttributeFilterTitle?: string,
) {
    const { run: changeTitle, status: titleChangeStatus } = useDashboardCommandProcessing({
        commandCreator: setAttributeFilterTitle,
        successEvent: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.TITLE_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const attributeFilterTitle = currentFilter.attributeFilter.title;
    const originalTitle = attributeFilterTitle ?? defaultAttributeFilterTitle;

    const [title, setTitle] = useState<string | undefined>(attributeFilterTitle);

    const titleChanged = originalTitle !== title;

    const onTitleUpdate = useCallback((value: string) => {
        setTitle(value);
    }, []);

    const onTitleChange = useCallback(() => {
        if (title !== attributeFilterTitle) {
            const updatedTitle = title !== defaultAttributeFilterTitle ? title : undefined;
            changeTitle(currentFilter.attributeFilter.localIdentifier!, updatedTitle);
        }
    }, [title, attributeFilterTitle, currentFilter, defaultAttributeFilterTitle, changeTitle]);

    const onTitleReset = useCallback(() => {
        setTitle(undefined);
    }, []);

    const onConfigurationClose = useCallback(() => {
        setTitle(attributeFilterTitle);
    }, [attributeFilterTitle]);

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
