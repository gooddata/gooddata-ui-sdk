// (C) 2024-2025 GoodData Corporation
import { AlertFilters } from "@gooddata/sdk-model";
import { alignConfigToAlignPoint, Overlay, UiButton } from "@gooddata/sdk-ui-kit";
import { useRef, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import { NotificationFiltersDetailDialog } from "./NotificationFiltersDetailDialog.js";

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
    filters: AlertFilters[];
}

const messages = defineMessages({
    buttonLabel: {
        id: "notifications.filters.buttonLabel",
    },
});

/**
 * @internal
 */
export function NotificationFiltersDetail({ filters }: INotificationFiltersDetailProps) {
    const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
    const intl = useIntl();
    const ref = useRef<HTMLButtonElement>(null);

    const closeFiltersDialog = () => setIsFiltersDialogOpen(false);
    const toggleFiltersDialog = () => setIsFiltersDialogOpen((x) => !x);

    return (
        <>
            {filters.length ? (
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
                    label={intl.formatMessage(messages.buttonLabel, { count: filters.length })}
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
                    <NotificationFiltersDetailDialog filters={filters} onClose={closeFiltersDialog} />
                </Overlay>
            ) : null}
        </>
    );
}
