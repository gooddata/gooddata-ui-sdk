// (C) 2024-2025 GoodData Corporation
import React from "react";

import { defineMessages, useIntl } from "react-intl";

import { AlertFilters } from "@gooddata/sdk-model";

import { bem } from "../bem.js";
import { DetailsDialog } from "../components/DetailsDialog.js";

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
    filters: AlertFilters[];
    onClose: () => void;
}

/**
 * @internal
 */
export function NotificationFiltersDetailDialog({ filters, onClose }: INotificationFiltersDetailDialogProps) {
    const intl = useIntl();

    return (
        <DetailsDialog
            title={`${intl.formatMessage(messages.title)} (${filters.length})`}
            content={
                <div className={b()}>
                    {filters.map(({ title, filter }, idx) => (
                        <div className={e("item")} key={idx}>
                            <div className={e("label")}>{title}</div>
                            <div className={e("values")}>{filter}</div>
                        </div>
                    ))}
                </div>
            }
            onClose={onClose}
        />
    );
}
