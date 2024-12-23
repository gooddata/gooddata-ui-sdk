// (C) 2024 GoodData Corporation
import React, { RefObject } from "react";
import cx from "classnames";
import { UiIcon } from "@gooddata/sdk-ui-kit";
import { bem } from "../bem.js";

const { b, e } = bem("gd-ui-ext-open-notifications-button");

/**
 * @alpha
 */
export interface IOpenNotificationsPanelButtonComponentProps {
    /**
     * Ref to the button element - is required for proper alignment of the notification panel.
     */
    buttonRef: RefObject<HTMLElement | null>;

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
export function DefaultOpenNotificationsPanelButton({
    buttonRef,
    isNotificationPanelOpen,
    toggleNotificationPanel,
    hasUnreadNotifications,
}: IOpenNotificationsPanelButtonComponentProps) {
    return (
        <button
            ref={buttonRef as RefObject<HTMLButtonElement>}
            className={cx(`gd-button gd-header-button ${b({ isOpen: isNotificationPanelOpen })}`)}
            onClick={toggleNotificationPanel}
        >
            <span className={e("icon")}>
                {hasUnreadNotifications ? <span className={e("unread-status")} /> : null}
                <UiIcon type="alert" size={14} color="complementary-0" />
            </span>
        </button>
    );
}
