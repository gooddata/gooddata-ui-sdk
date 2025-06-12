// (C) 2024-2025 GoodData Corporation
import React, { useMemo } from "react";
import { Bubble, BubbleHoverTrigger, Button, IIconProps } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

const ALIGN_POINTS_TOOLTIP = [{ align: "tc bc" }, { align: "cl cr" }];

type HeaderIconProps = {
    className?: string;
    tooltip?: string;
    Icon: React.FC<IIconProps>;
    onClick?: () => void;
    disabled?: boolean;
};

export const HeaderIcon: React.FC<HeaderIconProps> = ({ className, tooltip, Icon, onClick, disabled }) => {
    const randClassName = useMemo(() => `gd-gen-ai-chat-anchor--${Math.random()}`, []);
    const classes = cx("gd-gen-ai-chat__window__header__icon", className, {
        "gd-gen-ai-chat__window__header__icon--disabled": disabled,
        [randClassName]: true,
    });

    return (
        <div>
            <BubbleHoverTrigger showDelay={100}>
                <Button
                    className={classes}
                    data-gd-tooltip={disabled ? undefined : tooltip}
                    onClick={disabled ? undefined : onClick}
                    accessibilityConfig={{
                        ariaLabel: tooltip,
                    }}
                >
                    <Icon />
                </Button>
                {!disabled && tooltip ? (
                    <Bubble alignTo={randClassName} alignPoints={ALIGN_POINTS_TOOLTIP}>
                        {tooltip}
                    </Bubble>
                ) : null}
            </BubbleHoverTrigger>
        </div>
    );
};
