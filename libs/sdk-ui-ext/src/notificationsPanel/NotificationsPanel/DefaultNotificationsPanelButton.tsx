// (C) 2024-2026 GoodData Corporation

import { type RefObject } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiIcon } from "@gooddata/sdk-ui-kit";

import { NOTIFICATIONS_PANEL_ID } from "./DefaultNotificationsPanel.js";
import { bem } from "../bem.js";
const { b, e } = bem("gd-ui-ext-notifications-panel-button");

/**
 * OpenNotificationsPanelButton component props.
 *
 * @public
 */
export interface INotificationsPanelButtonComponentProps {
    /**
     * Ref to the button element - is required for proper alignment of the notification panel.
     */
    buttonRef: RefObject<HTMLButtonElement | null>;

    /**
     * Opens the notification panel.
     */
    openNotificationPanel: () => void;

    /**
     * Closes the notification panel.
     */
    closeNotificationPanel: () => void;

    /**
     * Toggles the notification panel.
     */
    toggleNotificationPanel: () => void;

    /**
     * Indicates whether the notification panel is open.
     */
    isNotificationPanelOpen: boolean;

    /**
     * Indicates whether there are unread notifications.
     */
    hasUnreadNotifications: boolean;
}

/**
 * @internal
 */
export function DefaultNotificationsPanelButton({
    buttonRef,
    isNotificationPanelOpen,
    toggleNotificationPanel,
    hasUnreadNotifications,
}: INotificationsPanelButtonComponentProps) {
    const intl = useIntl();
    const ariaControls = isNotificationPanelOpen ? { "aria-controls": NOTIFICATIONS_PANEL_ID } : {};
    return (
        <button
            ref={buttonRef}
            className={cx(`gd-button gd-header-button ${b({ isOpen: isNotificationPanelOpen })}`)}
            onClick={toggleNotificationPanel}
            aria-label={intl.formatMessage({ id: "notifications.panel.button.label" })}
            aria-expanded={isNotificationPanelOpen}
            aria-haspopup="true"
            {...ariaControls}
        >
            <span className={e("icon")}>
                {hasUnreadNotifications ? <span className={e("unread-status")} /> : null}
                <UiIcon type="alert" size={14} />
            </span>
        </button>
    );
}
