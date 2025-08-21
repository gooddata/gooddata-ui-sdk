// (C) 2024-2025 GoodData Corporation
import React, { ReactElement, useCallback } from "react";

import compact from "lodash/compact.js";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import { IWidgetDeleteDialogProps } from "./types.js";
import {
    dispatchAndWaitFor,
    eagerRemoveSectionItemByWidgetRef,
    selectAnalyticalWidgetByRef,
    selectDashboardUserAutomationAlertsInContext,
    selectDashboardUserAutomationSchedulesInContext,
    selectEnableAlerting,
    selectEnableScheduling,
    selectIsWidgetDeleteDialogOpen,
    selectWidgetDeleteDialogWidgetRef,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../model/index.js";

const deleteMessages = defineMessages({
    headline: {
        id: "deleteWidgetDialog.headline",
    },
    objects: {
        id: "deleteWidgetDialog.objectsMessage",
    },
    alerts: {
        id: "deleteWidgetDialog.alerts",
    },
    schedules: {
        id: "deleteWidgetDialog.schedules",
    },
    cancel: {
        id: "cancel",
    },
    delete: {
        id: "delete",
    },
});

/**
 * @internal
 */
export function useWidgetDeleteDialogProps(): IWidgetDeleteDialogProps {
    const dispatch = useDashboardDispatch();
    const onCancel = useCallback(() => dispatch(uiActions.closeWidgetDeleteDialog()), [dispatch]);
    const widgetRef = useDashboardSelector(selectWidgetDeleteDialogWidgetRef);
    const widget = useDashboardSelector(selectAnalyticalWidgetByRef(widgetRef));

    const onDelete = useCallback(() => {
        if (widget) {
            dispatchAndWaitFor(dispatch, eagerRemoveSectionItemByWidgetRef(widget.ref)).finally(() => {
                dispatch(uiActions.closeWidgetDeleteDialog());
            });
        }
    }, [dispatch, widget]);

    const isVisible = useDashboardSelector(selectIsWidgetDeleteDialogOpen);
    const isSchedulingEnabled = useDashboardSelector(selectEnableScheduling);
    const isAlertingEnabled = useDashboardSelector(selectEnableAlerting);
    const alerts = useDashboardSelector(
        selectDashboardUserAutomationAlertsInContext(widget?.localIdentifier),
    );
    const schedules = useDashboardSelector(
        selectDashboardUserAutomationSchedulesInContext(widget?.localIdentifier),
    );

    return {
        isVisible,
        showAlertsMessage: isAlertingEnabled && alerts.length > 0,
        showSchedulesMessage: isSchedulingEnabled && schedules.length > 0,
        onCancel,
        onDelete,
        widget,
    };
}

/**
 * @internal
 */
export function DefaultWidgetDeleteDialog(props: IWidgetDeleteDialogProps): ReactElement | null {
    const { isVisible, showAlertsMessage, showSchedulesMessage, onDelete, onCancel, widget } = props;
    const intl = useIntl();

    if (!isVisible || !widget) {
        return null;
    }

    const widgetTitle = widget.title;
    const messages = compact([
        showAlertsMessage && deleteMessages.alerts,
        showSchedulesMessage && deleteMessages.schedules,
    ]);

    return (
        <ConfirmDialog
            onCancel={onCancel}
            onSubmit={onDelete}
            isPositive={false}
            className="s-dialog s-delete_widget_dialog"
            headline={intl.formatMessage(deleteMessages.headline)}
            cancelButtonText={intl.formatMessage(deleteMessages.cancel)}
            submitButtonText={intl.formatMessage(deleteMessages.delete)}
        >
            <div>
                <FormattedMessage id={deleteMessages.objects.id} values={{ title: widgetTitle }} />
                <ul className="gd-delete-dialog-objects-list">
                    {messages.map((message) => (
                        <li key={message.id}>
                            <FormattedMessage {...message} />
                        </li>
                    ))}
                </ul>
            </div>
        </ConfirmDialog>
    );
}
