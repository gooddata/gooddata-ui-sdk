// (C) 2024 GoodData Corporation
import React from "react";
import { IIconProps } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

type HeaderIconProps = {
    className?: string;
    tooltip?: string;
    Icon: React.FC<IIconProps>;
    onClick?: () => void;
    disabled?: boolean;
};

export const HeaderIcon: React.FC<HeaderIconProps> = ({ className, tooltip, Icon, onClick, disabled }) => {
    const classes = cx("gd-gen-ai-chat__window__header__icon", className, {
        "gd-gen-ai-chat__window__header__icon--disabled": disabled,
    });

    return (
        <div
            className={classes}
            data-gd-tooltip={disabled ? undefined : tooltip}
            onClick={disabled ? undefined : onClick}
        >
            <Icon />
        </div>
    );
};
