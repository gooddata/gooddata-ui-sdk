// (C) 2023-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { type IDashboardAttributeFilter } from "@gooddata/sdk-model";

import { setAttributeFilterTitle } from "../../../../../../model/commands/filters.js";
import { useDashboardCommandProcessing } from "../../../../../../model/react/useDashboardCommandProcessing.js";
import { useDashboardUserInteraction } from "../../../../../../model/react/useDashboardUserInteraction.js";

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
        if (title === originalTitle) {
            return;
        }
        const updatedTitle = title === defaultAttributeFilterTitle ? undefined : title?.trim();
        changeTitle(currentFilter.attributeFilter.localIdentifier!, updatedTitle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, currentFilter, defaultAttributeFilterTitle, changeTitle]);

    const onTitleReset = useCallback(() => {
        setTitle(undefined);
        userInteraction.attributeFilterInteraction("attributeFilterTitleResetClicked");
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
