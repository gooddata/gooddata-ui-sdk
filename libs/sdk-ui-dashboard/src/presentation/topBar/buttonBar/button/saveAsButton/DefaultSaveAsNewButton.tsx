// (C) 2021-2022 GoodData Corporation

import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";
import {
    selectCanCreateAnalyticalDashboard,
    selectDashboardEditModeDevRollout,
    selectEnableKPIDashboardSaveAsNew,
    selectIsSaveAsNewButtonHidden,
    selectIsExport,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model";
import { ISaveAsNewButtonProps } from "./types";
import { selectCanEnterEditModeAndIsLoaded } from "../selectors";
import { createSelector } from "@reduxjs/toolkit";

/**
 * @internal
 */
export const selectIsSaveAsNewButtonVisible = createSelector(
    selectDashboardEditModeDevRollout,
    selectEnableKPIDashboardSaveAsNew,
    selectIsSaveAsNewButtonHidden,
    selectCanEnterEditModeAndIsLoaded,
    selectCanCreateAnalyticalDashboard,
    selectIsExport,
    (
        isEditModeDevRollout,
        isSaveAsNewEnabled,
        isSaveAsButtonHidden,
        isDashboardEditable,
        canCreateDashboard,
        isExport,
    ) => {
        /*
         * The reasoning behind this condition is as follows. Do not show separate Save As button if:
         *
         * 0.  edit mode rollout flag enabled
         *
         * 1.  The feature is not enabled or
         * 2.  If is disabled by config
         * 3.  If the dashboard can be edited; in this case, the save as option is part of the dropdown menu;
         *     it is somewhat more hidden
         * 4.  dashboard is not in export mode
         * 5.  If the user cannot create dashboards - e.g. does not have permissions to do so (is viewer for example).
         */
        return (
            isEditModeDevRollout &&
            isSaveAsNewEnabled &&
            !isSaveAsButtonHidden &&
            !isDashboardEditable &&
            !isExport &&
            canCreateDashboard
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
