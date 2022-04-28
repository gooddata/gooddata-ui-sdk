// (C) 2021-2022 GoodData Corporation

import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";
import {
    DashboardState,
    selectCanCreateAnalyticalDashboard,
    selectEnableKPIDashboardSaveAsNew,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model";
import { ISaveAsNewButtonProps } from "./types";
import { selectShouldHideControlButtons } from "../selectors";
import { selectIsSaveAsNewButtonHidden } from "../../../../../model/store/config/configSelectors";

/**
 * @internal
 */
export function selectIsSaveAsNewButtonVisible(state: DashboardState) {
    const isDashboardEditable = !selectShouldHideControlButtons(state);
    const canCreateDashboard = selectCanCreateAnalyticalDashboard(state);
    const isSaveAsButtonHidden = selectIsSaveAsNewButtonHidden(state);
    const isSaveAsNewEnabled = selectEnableKPIDashboardSaveAsNew(state);

    /*
     * The reasoning behind this condition is as follows. Do not show separate Save As button if:
     *
     * 1.  The feature is not enabled or
     * 2.  If is disabled by config
     * 3.  If the dashboard can be edited; in this case, the save as option is part of the dropdown menu;
     *     it is somewhat more hidden
     * 4.  If the user cannot create dashboards - e.g. does not have permissions to do so (is viewer for example).
     */
    return isSaveAsNewEnabled && !isSaveAsButtonHidden && !isDashboardEditable && canCreateDashboard;
}

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
