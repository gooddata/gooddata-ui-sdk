// (C) 2025-2026 GoodData Corporation

import { type MouseEvent } from "react";

import cx from "classnames";

import { QuestionMark } from "../../Icon/icons/QuestionMark.js";
import { ShortenedText } from "../../ShortenedText/ShortenedText.js";
import { Typography } from "../../Typography/Typography.js";
import { type SizeLarge, type SizeMedium } from "../@types/size.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

/**
 * @internal
 */
export interface IUiSubmenuHeaderProps {
    title?: string;
    tooltipText?: string;
    onBack?: (e: MouseEvent<HTMLButtonElement>) => void;
    onClose?: (e: MouseEvent<HTMLButtonElement>) => void;
    backAriaLabel?: string;
    closeAriaLabel?: string;
    useShortenedTitle?: boolean;
    textColor?: string;
    backgroundColor?: string;
    height?: SizeMedium | SizeLarge;
    titleId?: string;
}

/**
 * Unified submenu header: optional back button, title, and optional close button.
 * Title can render as Typography h3 or ShortenedText h3.
 * @internal
 */
export function UiSubmenuHeader({
    title = "",
    tooltipText,
    onBack,
    onClose,
    backAriaLabel,
    closeAriaLabel,
    useShortenedTitle,
    textColor,
    backgroundColor,
    height = "medium",
    titleId,
}: IUiSubmenuHeaderProps) {
    const heightClass = cx({
        "gd-ui-kit-submenu-header--large": height === "large",
        "gd-ui-kit-submenu-header--medium": height === "medium",
    });

    const backButtonSize = "small";
    const closeButtonSize = "small";

    return (
        <div
            className={cx("gd-ui-kit-submenu-header", heightClass)}
            style={{ backgroundColor: backgroundColor, color: textColor }}
        >
            {onBack ? (
                <UiIconButton
                    icon={"navigateLeft"}
                    variant="bare"
                    size={backButtonSize}
                    onClick={onBack}
                    label={backAriaLabel}
                    dataId={"s-submenu-header-back-button"}
                    dataTestId={"s-submenu-header-back-button"}
                />
            ) : null}

            <div className={cx("gd-ui-kit-submenu-header__title")}>
                {useShortenedTitle ? (
                    <ShortenedText
                        tagName={"h3"}
                        className={cx("gd-ui-kit-submenu-header__title-text")}
                        id={titleId}
                    >
                        {title}
                    </ShortenedText>
                ) : (
                    <Typography
                        tagName="h3"
                        className={cx("gd-ui-kit-submenu-header__title-text")}
                        id={titleId}
                    >
                        {title}
                    </Typography>
                )}
                {tooltipText ? (
                    <UiTooltip
                        triggerBy={["hover", "focus"]}
                        arrowPlacement="left"
                        optimalPlacement
                        content={
                            <div className="gd-ui-kit-submenu-header__title-tooltip-content">
                                {tooltipText}
                            </div>
                        }
                        anchor={
                            <QuestionMark
                                className="gd-ui-kit-submenu-header__title-tooltip-icon"
                                width={14}
                                height={14}
                                color="var(--gd-palette-complementary-6)"
                            />
                        }
                        offset={10}
                        anchorWrapperStyles={{ lineHeight: 0, width: "fit-content" }}
                    />
                ) : null}
            </div>

            {onClose ? (
                <UiIconButton
                    size={closeButtonSize}
                    variant="bare"
                    icon="close"
                    label={closeAriaLabel}
                    onClick={onClose}
                    dataId={"s-submenu-header-close-button"}
                    dataTestId={"s-submenu-header-close-button"}
                />
            ) : null}
        </div>
    );
}
