// (C) 2022-2023 GoodData Corporation
import { IDashboardAttributeFilter } from "@gooddata/sdk-model";
import { useState, useCallback } from "react";
import isEqual from "lodash/isEqual";
import { setAttributeFilterTitle, useDashboardCommandProcessing } from "../../../../../../model";

// TODO: update with right logic during implementation
export function useTitleConfiguration(currentFilter: IDashboardAttributeFilter) {
    const { run: changeTitle, status: titleChangeStatus } = useDashboardCommandProcessing({
        commandCreator: setAttributeFilterTitle,
        successEvent: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.TITLE_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const originalTitle = currentFilter.attributeFilter.title;

    const [title, setTitle] = useState<string | undefined>(originalTitle);

    const titleChanged = !isEqual(originalTitle, title);

    const onTitleUpdate = useCallback(() => {
        setTitle("Custom Title");
    }, []);

    const onTitleChange = useCallback(() => {
        console.log("useTitleConfiguration", title);
        changeTitle(currentFilter.attributeFilter.localIdentifier!, "Custom Title");
    }, []);

    const onTitleReset = useCallback(() => {
        setTitle(undefined);
        changeTitle(currentFilter.attributeFilter.localIdentifier!, undefined);
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
