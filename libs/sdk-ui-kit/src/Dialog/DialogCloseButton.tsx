// (C) 2022-2025 GoodData Corporation

import { memo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { IntlWrapper } from "@gooddata/sdk-ui";

import { type IDialogCloseButtonProps } from "./typings.js";
import { Button } from "../Button/Button.js";

/**
 * @internal
 */
export const DialogCloseButtonCore = memo<IDialogCloseButtonProps>(function DialogCloseButton({
    className,
    accessibilityConfig,
    onClose,
}) {
    const intl = useIntl();
    const closeButtonAccessibilityConfig = {
        ariaLabel: intl.formatMessage({ id: "dialogs.closeLabel" }),
        ariaDescribedBy: accessibilityConfig?.titleElementId,
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
export function DialogCloseButton(props: IDialogCloseButtonProps) {
    return (
        // TODO: local has to be passed as a prop
        // pay attention since there is focus manager and different locales are loaded asynchronously
        // there is delay and focus manager could failed because children are not rendered yet
        <IntlWrapper locale="en-US">
            <DialogCloseButtonCore {...props} />
        </IntlWrapper>
    );
}
