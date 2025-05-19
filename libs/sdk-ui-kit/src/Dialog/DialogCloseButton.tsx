// (C) 2022-2025 GoodData Corporation
import React from "react";
import { IDialogCloseButtonProps } from "./typings.js";
import { Button } from "../Button/index.js";
import { useIntl } from "react-intl";
import { IntlWrapper } from "@gooddata/sdk-ui";
import cx from "classnames";

const DialogCloseButtonCore = React.memo<IDialogCloseButtonProps>(function DialogCloseButton({
    className,
    accessibilityConfig,
    onClose,
}) {
    const intl = useIntl();
    const closeButtonAccessibilityConfig = {
        ariaLabel: intl.formatMessage({ id: "dialogs.closeLabel" }),
        ...accessibilityConfig?.closeButton,
    };

    return (
        <div className="gd-dialog-close">
            <Button
                className={cx(
                    "gd-button-link gd-button-icon-only gd-icon-cross s-dialog-close-button",
                    className,
                )}
                onClick={onClose}
                accessibilityConfig={closeButtonAccessibilityConfig}
            />
        </div>
    );
});

/**
 * @internal
 */
export const DialogCloseButton: React.FC<IDialogCloseButtonProps> = (props) => (
    <IntlWrapper>
        <DialogCloseButtonCore {...props} />
    </IntlWrapper>
);
