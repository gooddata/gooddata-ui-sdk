// (C) 2023 GoodData Corporation
import { useState, useCallback } from "react";
import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import {
    selectDateFilterConfigsOverrides,
    selectEffectiveDateFilterTitle,
    setDateFilterConfigTitle,
    useDashboardCommandProcessing,
    useDashboardSelector,
    useDashboardUserInteraction,
} from "../../../../../model/index.js";

export function useDateFilterTitleConfiguration(
    dateDataSet: ObjRef | undefined,
    defaultDateFilterTitle: string,
) {
    const { run: changeTitle, status: titleChangeStatus } = useDashboardCommandProcessing({
        commandCreator: setDateFilterConfigTitle,
        successEvent: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.TITLE_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const userInteraction = useDashboardUserInteraction();
    const customCommonDateFilterTitle = useDashboardSelector(selectEffectiveDateFilterTitle);
    const filterConfigByDimension = useDashboardSelector(selectDateFilterConfigsOverrides);

    let originalTitle: string;

    const config = dateDataSet
        ? filterConfigByDimension.find((config) => areObjRefsEqual(config.dateDataSet, dateDataSet))?.config
        : undefined;

    if (dateDataSet) {
        originalTitle = !config || config?.filterName === "" ? defaultDateFilterTitle : config?.filterName;
    } else {
        originalTitle = customCommonDateFilterTitle ?? defaultDateFilterTitle;
    }

    const [title, setTitle] = useState<string | undefined>(originalTitle);

    const titleChanged = originalTitle !== title;

    const onTitleUpdate = useCallback((value: string) => {
        setTitle(value);
    }, []);

    const onTitleChange = useCallback(() => {
        if (titleChanged) {
            const updatedTitle = title !== defaultDateFilterTitle ? title?.trim() : undefined;
            changeTitle(dateDataSet, updatedTitle);
        }
    }, [title, dateDataSet, defaultDateFilterTitle, changeTitle]);

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
