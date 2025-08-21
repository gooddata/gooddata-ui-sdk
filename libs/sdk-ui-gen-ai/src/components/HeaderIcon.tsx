// (C) 2024-2025 GoodData Corporation
import React, { useMemo } from "react";

import cx from "classnames";

import { Bubble, BubbleHoverTrigger, Button, IIconProps } from "@gooddata/sdk-ui-kit";

const ALIGN_POINTS_TOOLTIP = [{ align: "tc bc" }, { align: "cl cr" }];

type HeaderIconProps = {
    className?: string;
    tooltip?: string;
    Icon: React.FC<IIconProps>;
    onClick?: () => void;
    disabled?: boolean;
};

export function HeaderIcon({ className, tooltip, Icon, onClick, disabled }: HeaderIconProps) {
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
                    <Icon ariaHidden />
                </Button>
                {!disabled && tooltip ? (
                    <Bubble alignTo={randClassName} alignPoints={ALIGN_POINTS_TOOLTIP}>
                        {tooltip}
                    </Bubble>
                ) : null}
            </BubbleHoverTrigger>
        </div>
    );
}
