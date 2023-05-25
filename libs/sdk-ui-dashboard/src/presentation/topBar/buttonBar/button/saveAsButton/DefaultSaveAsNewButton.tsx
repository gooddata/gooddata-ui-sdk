// (C) 2021-2023 GoodData Corporation

import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";
import {
    selectCanCreateAnalyticalDashboard,
    selectEnableKPIDashboardSaveAsNew,
    selectIsSaveAsNewButtonHidden,
    selectIsExport,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
    selectIsReadOnly,
    DashboardSelector,
} from "../../../../../model/index.js";
import { ISaveAsNewButtonProps } from "./types.js";
import { selectCanEnterEditModeAndIsLoaded } from "../selectors.js";
import { createSelector } from "@reduxjs/toolkit";

/**
 * @internal
 */
export const selectIsSaveAsNewButtonVisible: DashboardSelector<boolean> = createSelector(
    selectEnableKPIDashboardSaveAsNew,
    selectIsSaveAsNewButtonHidden,
    selectCanEnterEditModeAndIsLoaded,
    selectCanCreateAnalyticalDashboard,
    selectIsExport,
    selectIsReadOnly,
    (
        isSaveAsNewEnabled,
        isSaveAsButtonHidden,
        isDashboardEditable,
        canCreateDashboard,
        isExport,
        isReadOnly,
    ) => {
        /*
         * The reasoning behind this condition is as follows. Do not show separate Save As button if:
         *
         *
         * 1.  The feature is not enabled or
         * 2.  If is disabled by config
         * 3.  If the dashboard can be edited; in this case, the save as option is part of the dropdown menu;
         *     it is somewhat more hidden
         * 4.  dashboard is not in export mode
         * 5.  If the user cannot create dashboards - e.g. does not have permissions to do so (is viewer for example).
         * 6.  If the dashboard is in read-only mode.
         */
        return (
            isSaveAsNewEnabled &&
            !isSaveAsButtonHidden &&
            !isDashboardEditable &&
            !isExport &&
            canCreateDashboard &&
            !isReadOnly
        );
    },
);

/**
 * @internal
 */
export function useSaveAsNewButtonProps(): ISaveAsNewButtonProps {
    const dashboardDispatch = useDashboardDispatch();
    const isVisible = useDashboardSelector(selectIsSaveAsNewButtonVisible);

    const onSaveAsNewClick = useCallback(() => {
        dashboardDispatch(uiActions.openSaveAsDialog());
    }, [dashboardDispatch]);

    return {
        isVisible,
        onSaveAsNewClick,
    };
}

/**
 * @internal
 */
export function DefaultSaveAsNewButton({ isVisible, onSaveAsNewClick }: ISaveAsNewButtonProps) {
    const intl = useIntl();

    if (!isVisible) {
        return null;
    }

    return (
        <Button
            className="gd-button-secondary s-save_as_new_button"
            value={intl.formatMessage({ id: "save.as.new" })}
            onClick={onSaveAsNewClick}
        />
    );
}
