// (C) 2023-2025 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { Button } from "../Button/index.js";

/**
 * @internal
 */
export interface IBackButtonProps {
    onClick: () => void;
    className: string;
}

/**
 * @internal
 */
export const BackButton: React.FC<IBackButtonProps> = ({ onClick, className }) => {
    const intl = useIntl();

    return (
        <Button
            value={""}
            className={cx(
                "gd-button-primary gd-button-icon-only gd-icon-navigateleft gd-share-dialog-header-back-button",
                className,
            )}
            onClick={onClick}
            accessibilityConfig={{
                ariaLabel: intl.formatMessage({ id: "dialogs.backButtonLabel" }),
            }}
        />
    );
};
