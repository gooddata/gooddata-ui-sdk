// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { isMac } from "../../../shared/platform.js";
import { makeStyles } from "../../../shared/theme/index.js";

const useStyles = makeStyles()(() => {
    return {
        button: {
            outline: "none",
            border: "none",
            boxShadow: "none !important",
            display: "inline-flex",
            alignItems: "center",
            height: "100%",
            fontSize: "12px",

            ".gd-button-text": {
                textDecoration: "underline !important",
            },
            ".gd-button-icon": {
                display: "flex",
                fontSize: "16px",
                width: 18,
            },
        },
    };
});

export function PartHeaderButton({
    onClick,
    disabled,
    iconLeft,
    elementIconLeft,
    iconRight,
    value,
    tooltip,
    tooltipMac,
    disabledTooltip,
    disabledTooltipMac,
    sClassName,
    className,
}: {
    iconLeft?: string;
    elementIconLeft?: ReactElement;
    iconRight?: string;
    value?: string;
    tooltip?: string;
    tooltipMac?: string;
    disabledTooltip?: string;
    disabledTooltipMac?: string;
    sClassName?: string;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
}) {
    const { classes, cx } = useStyles();

    return (
        <BubbleHoverTrigger showDelay={500}>
            <button
                title=""
                className={cx(
                    "gd-button-link-dimmed",
                    "gd-button",
                    classes.button,
                    className,
                    sClassName,
                    disabled && "disabled",
                )}
                type="button"
                tabIndex={-1}
                onClick={() => !disabled && onClick?.()}
            >
                {iconLeft && <span className={cx("gd-button-icon", iconLeft)} role="button-icon"></span>}
                {!!elementIconLeft && (
                    <span className={cx("gd-button-icon")} role="button-icon">
                        {elementIconLeft}
                    </span>
                )}
                {value && <span className="gd-button-text">{value}</span>}
                {iconRight && <span className={cx("gd-button-icon", iconRight)} role="button-icon"></span>}
            </button>
            {!disabled && Boolean(tooltip) && (
                <Bubble className="bubble-primary" alignPoints={[{ align: "bc tr" }]}>
                    {isMac() ? tooltipMac || tooltip : tooltip}
                </Bubble>
            )}
            {disabled && Boolean(disabledTooltip) && (
                <Bubble className="bubble-primary" alignPoints={[{ align: "bc tr" }]}>
                    {isMac() ? disabledTooltipMac || disabledTooltip : disabledTooltip}
                </Bubble>
            )}
        </BubbleHoverTrigger>
    );
}
