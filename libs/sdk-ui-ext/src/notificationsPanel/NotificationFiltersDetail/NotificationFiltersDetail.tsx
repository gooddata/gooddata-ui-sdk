// (C) 2024-2026 GoodData Corporation

import { useRef, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import { Overlay, UiButton, alignConfigToAlignPoint } from "@gooddata/sdk-ui-kit";

import { type AlertItem, NotificationFiltersDetailDialog } from "./NotificationFiltersDetailDialog.js";

const ALIGN_POINTS = [
    alignConfigToAlignPoint({
        triggerAlignPoint: "bottom-right",
        overlayAlignPoint: "top-right",
        offset: { x: 2, y: 3 },
    }),
];

/**
 * @internal
 */
export interface INotificationFiltersDetailProps {
    items: AlertItem[];
}

const messages = defineMessages({
    buttonLabel: {
        id: "notifications.filters.buttonLabel",
    },
});

/**
 * @internal
 */
export function NotificationFiltersDetail({ items }: INotificationFiltersDetailProps) {
    const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
    const intl = useIntl();
    const ref = useRef<HTMLButtonElement>(null);

    const closeFiltersDialog = () => setIsFiltersDialogOpen(false);
    const toggleFiltersDialog = () => setIsFiltersDialogOpen((x) => !x);

    return (
        <>
            {items.length > 0 ? (
                <UiButton
                    ref={ref}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFiltersDialog();
                    }}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                    variant="tertiary"
                    size="small"
                    label={intl.formatMessage(messages.buttonLabel, { count: items.length })}
                />
            ) : null}
            {isFiltersDialogOpen ? (
                <Overlay
                    isModal={false}
                    alignTo={ref.current}
                    alignPoints={ALIGN_POINTS}
                    closeOnEscape
                    closeOnOutsideClick
                    closeOnParentScroll
                    closeOnMouseDrag={false}
                    onClose={closeFiltersDialog}
                >
                    <NotificationFiltersDetailDialog items={items} onClose={closeFiltersDialog} />
                </Overlay>
            ) : null}
        </>
    );
}
