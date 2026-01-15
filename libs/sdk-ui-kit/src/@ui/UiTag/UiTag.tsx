// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, forwardRef, useLayoutEffect, useState } from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { type IconType } from "../@types/icon.js";
import { type ThemeColor } from "../@types/themeColors.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

const { b, e } = bem("gd-ui-kit-tag");

/**
 * @internal
 */
export interface IUiTagAccessibilityConfig extends IAccessibilityConfigBase {
    deleteAriaLabel?: string;
}

/**
 * @internal
 */
export type UiTagProps = {
    label: string;
    variant?: "solid" | "outlined" | "decorated";
    size?: "small" | "large";
    iconBefore?: IconType;
    iconBeforeColor?: ThemeColor;
    isDeletable?: boolean;
    isDisabled?: boolean;
    dataTestId?: string;
    accessibilityConfig?: IUiTagAccessibilityConfig;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    onDelete?: (e: MouseEvent<HTMLButtonElement>) => void;
    onDeleteKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
    tabIndex?: number;
    deleteTabIndex?: number;
};

/**
 * @internal
 */
export const UiTag = forwardRef<HTMLButtonElement, UiTagProps>(function UiTag(
    {
        label,
        size = "small",
        variant = "solid",
        iconBefore,
        iconBeforeColor,
        tabIndex,
        deleteTabIndex,
        accessibilityConfig,
        isDisabled,
        isDeletable,
        dataTestId,
        onClick,
        onDelete,
        onDeleteKeyDown,
    }: UiTagProps,
    ref,
) {
    const [labelRef, setLabelRef] = useState<HTMLSpanElement | null>(null);
    const [hasTooltip, setHasTooltip] = useState(false);
    const { ariaLabel, ariaLabelledBy, deleteAriaLabel } = accessibilityConfig ?? {};

    useLayoutEffect(() => {
        if (labelRef && labelRef.offsetWidth < labelRef.scrollWidth) {
            setHasTooltip(true);
        } else {
            setHasTooltip(false);
        }
    }, [labelRef]);

    const iconSize = size === "small" ? 14 : 16;
    const defaultIconColor = variant === "decorated" ? "complementary-0" : "complementary-6";
    const iconColor = iconBeforeColor ?? defaultIconColor;

    const button = (
        <button
            ref={ref}
            tabIndex={tabIndex}
            data-testid={dataTestId}
            className={e("trigger", { isDeletable: isDeletable ?? false, isDisabled: isDisabled ?? false })}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            onClick={onClick}
        >
            {iconBefore ? (
                <span className={e("icon-before")}>
                    <UiIcon type={iconBefore} size={iconSize} color={iconColor} />
                </span>
            ) : null}
            <span className={e("label")} ref={setLabelRef}>
                {label}
            </span>
        </button>
    );

    return (
        <div className={b({ size, variant })}>
            {hasTooltip ? (
                <UiTooltip
                    anchor={button}
                    content={<div className={e("tooltip")}>{label}</div>}
                    triggerBy={["hover"]}
                    arrowPlacement="top"
                />
            ) : (
                button
            )}
            {isDeletable && !isDisabled ? (
                <button
                    tabIndex={deleteTabIndex}
                    data-testid={dataTestId ? `${dataTestId}-delete-button` : undefined}
                    aria-label={deleteAriaLabel}
                    className={e("delete")}
                    onClick={onDelete}
                    onKeyDown={onDeleteKeyDown}
                >
                    <span className={e("icon-delete")}>
                        <UiIcon
                            size={14}
                            type="cross"
                            color={variant === "decorated" ? "complementary-0" : "complementary-6"}
                        />
                    </span>
                </button>
            ) : null}
        </div>
    );
});
