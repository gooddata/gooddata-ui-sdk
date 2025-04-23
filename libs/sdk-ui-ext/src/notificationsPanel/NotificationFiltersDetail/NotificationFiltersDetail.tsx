// (C) 2024-2025 GoodData Corporation
import { alignConfigToAlignPoint, Overlay, UiButton } from "@gooddata/sdk-ui-kit";
import React, { useRef, useState } from "react";
import { IAlertNotification } from "@gooddata/sdk-model";
import { NotificationFiltersDetailDialog } from "./NotificationFiltersDetailDialog.js";
import { defineMessages, useIntl } from "react-intl";

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
    notification: IAlertNotification;
}

const messages = defineMessages({
    buttonLabel: {
        id: "notifications.filters.buttonLabel",
    },
});

/**
 * @internal
 */
export function NotificationFiltersDetail({ notification }: INotificationFiltersDetailProps) {
    const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
    const intl = useIntl();
    const ref = useRef<HTMLButtonElement>(null);
    const filterCount = 0;
    const closeFiltersDialog = () => setIsFiltersDialogOpen(false);
    const toggleFiltersDialog = () => setIsFiltersDialogOpen((x) => !x);
    const onButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        toggleFiltersDialog();
    };

    return (
        <>
            {filterCount && filterCount > 0 ? (
                <UiButton
                    buttonRef={ref}
                    onClick={onButtonClick}
                    variant="tertiary"
                    size="small"
                    label={intl.formatMessage(messages.buttonLabel)}
                />
            ) : null}
            {isFiltersDialogOpen ? (
                <Overlay
                    isModal={false}
                    alignTo={ref.current}
                    alignPoints={ALIGN_POINTS}
                    closeOnEscape
                    closeOnOutsideClick
                    closeOnParentScroll={true}
                    closeOnMouseDrag={false}
                    onClose={closeFiltersDialog}
                >
                    <NotificationFiltersDetailDialog
                        notification={notification}
                        onClose={closeFiltersDialog}
                    />
                </Overlay>
            ) : null}
        </>
    );
}
