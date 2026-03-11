// (C) 2023-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { Button } from "../Button/Button.js";

/**
 * @internal
 */
export interface IBackButtonProps {
    onClick: () => void;
    className: string;
    disabled?: boolean;
}

/**
 * @internal
 */
export function BackButton({ onClick, className, disabled }: IBackButtonProps) {
    const intl = useIntl();

    return (
        <Button
            value={""}
            className={cx(
                "gd-button-primary gd-button-icon-only gd-icon-navigateleft gd-share-dialog-header-back-button",
                className,
            )}
            onClick={onClick}
            disabled={disabled}
            accessibilityConfig={{
                ariaLabel: intl.formatMessage({ id: "dialogs.backButtonLabel" }),
            }}
        />
    );
}
