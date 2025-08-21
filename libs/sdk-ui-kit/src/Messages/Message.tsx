// (C) 2007-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { IMessageProps } from "./typings.js";
import { Button } from "../Button/index.js";

/**
 * @internal
 */
export function Message({ onClose, type, children, className, contrast, intensive }: IMessageProps) {
    const intl = useIntl();

    const classes = cx("gd-message", "s-message", className, {
        success: type === "success",
        information: type === "progress",
        error: type === "error",
        warning: type === "warning",
        contrast,
        intensive,
    });

    const accesibilityRole = type === "error" ? "alert" : "status";

    const accessibilityAriaLabel = intl.formatMessage({
        id: "message.accessibility.dismiss.notification",
    });
    return (
        <div role={accesibilityRole} aria-live={type === "error" ? undefined : "polite"} className={classes}>
            <div className="gd-message-text">
                {children}
                {onClose ? (
                    <Button
                        className="gd-message-dismiss gd-icon-cross s-dialog-close-button"
                        onClick={onClose}
                        accessibilityConfig={{
                            ariaLabel: accessibilityAriaLabel,
                        }}
                    />
                ) : null}
            </div>
        </div>
    );
}
