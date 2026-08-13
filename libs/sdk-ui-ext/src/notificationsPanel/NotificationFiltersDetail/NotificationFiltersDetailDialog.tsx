// (C) 2024-2026 GoodData Corporation

import { defineMessages, useIntl } from "react-intl";

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
export type AlertItem = {
    title?: string;
    value: string;
};

/**
 * @internal
 */
export interface INotificationFiltersDetailDialogProps {
    items: AlertItem[];
    onClose: () => void;
}

/**
 * @internal
 */
export function NotificationFiltersDetailDialog({ items, onClose }: INotificationFiltersDetailDialogProps) {
    const intl = useIntl();

    return (
        <DetailsDialog
            title={`${intl.formatMessage(messages.title)} (${items.length})`}
            content={
                <div className={b()}>
                    {items.map(({ title, value }, idx) => (
                        <div className={e("item")} key={idx}>
                            <div className={e("label")}>{title}</div>
                            <div className={e("values")}>{value}</div>
                        </div>
                    ))}
                </div>
            }
            onClose={onClose}
        />
    );
}
