// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";
import { IWidget } from "@gooddata/sdk-model";
import { selectEnableScheduling, uiActions } from "../../store/index.js";
import { useDashboardDispatch, useDashboardSelector } from "../DashboardStoreProvider.js";
import { refreshAutomations as refreshAutomationsCommand } from "../../commands/index.js";

/**
 * @internal
 */
export const useDashboardScheduledEmailsCommands = () => {
    const dispatch = useDashboardDispatch();

    // Feature Flags
    const isScheduledEmailingEnabled = useDashboardSelector(selectEnableScheduling);

    // Single Schedule Dialog
    const openScheduleEmailingDialog = useCallback(
        (widget?: IWidget) =>
            isScheduledEmailingEnabled &&
            dispatch(
                uiActions.openScheduleEmailDialog({
                    ...(widget?.ref ? { widgetRef: widget.ref } : {}),
                }),
            ),
        [dispatch, isScheduledEmailingEnabled],
    );
    const closeScheduleEmailingDialog = useCallback(
        () => isScheduledEmailingEnabled && dispatch(uiActions.closeScheduleEmailDialog()),
        [dispatch, isScheduledEmailingEnabled],
    );

    // List / Management Dialog
    const openScheduleEmailingManagementDialog = useCallback(
        (widget?: IWidget) =>
            isScheduledEmailingEnabled &&
            dispatch(
                uiActions.openScheduleEmailManagementDialog({
                    ...(widget?.ref ? { widgetRef: widget.ref } : {}),
                }),
            ),
        [dispatch, isScheduledEmailingEnabled],
    );
    const closeScheduleEmailingManagementDialog = useCallback(
        () => isScheduledEmailingEnabled && dispatch(uiActions.closeScheduleEmailManagementDialog()),
        [dispatch, isScheduledEmailingEnabled],
    );

    // Data Reload
    const refreshAutomations = useCallback(() => dispatch(refreshAutomationsCommand()), [dispatch]);

    return {
        openScheduleEmailingDialog,
        closeScheduleEmailingDialog,
        openScheduleEmailingManagementDialog,
        closeScheduleEmailingManagementDialog,
        refreshAutomations,
    };
};
