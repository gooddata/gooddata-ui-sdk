// (C) 2023 GoodData Corporation

import React from "react";
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
    return (
        <Button
            value={""}
            className={cx(
                "gd-button-primary gd-button-icon-only gd-icon-navigateleft gd-share-dialog-header-back-button",
                className,
            )}
            onClick={onClick}
        />
    );
};
