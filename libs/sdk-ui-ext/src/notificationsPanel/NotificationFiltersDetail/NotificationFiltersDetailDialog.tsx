// (C) 2024 GoodData Corporation
import { IAlertNotification } from "@gooddata/sdk-model";
import React from "react";
import { UiSkeleton } from "@gooddata/sdk-ui-kit";
import { DetailsDialog } from "../components/DetailsDialog.js";
import { useNotificationsFilterDetail } from "../data/useNotificationFiltersDetail.js";
import { bem } from "../bem.js";
import { defineMessages, useIntl } from "react-intl";

const { b, e } = bem("gd-ui-ext-notification-filters-detail-dialog");

const messages = defineMessages({
    title: {
        id: "notifications.filters.dialog.title",
    },
});

/**
 * @internal
 */
export interface INotificationFiltersDetailDialogProps {
    notification: IAlertNotification;
    onClose: () => void;
}

/**
 * @internal
 */
export function NotificationFiltersDetailDialog({
    notification,
    onClose,
}: INotificationFiltersDetailDialogProps) {
    const intl = useIntl();
    const { filtersInfo, automationPromise } = useNotificationsFilterDetail(notification);
    const filtersCount = notification.details.data.alert.filterCount ?? 0;

    return (
        <DetailsDialog
            title={intl.formatMessage(messages.title)}
            content={
                <div className={b()}>
                    {automationPromise.status !== "success" ? (
                        <UiSkeleton itemHeight={32} itemsCount={filtersCount} />
                    ) : (
                        filtersInfo?.map(({ title, subtitle }, idx) => (
                            <div className={e("item")} key={idx}>
                                <div className={e("label")}>{title}</div>
                                <div className={e("values")}>{subtitle}</div>
                            </div>
                        ))
                    )}
                </div>
            }
            onClose={onClose}
        />
    );
}
