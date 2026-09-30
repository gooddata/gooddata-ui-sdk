// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { useId } from "../../utils/useId.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

import { type IChipContentProps } from "./types.js";

const { e } = bem("gd-ui-kit-chip");

const ICON_SIZE = 14;

export function ChipContent({
    label,
    tag,
    iconBefore,
    iconAfter,
    iconColor = "primary",
    variant = "normal",
    onClick,
    onKeyDown,
    isActive,
    isLocked,
    isExpandable,
    isDisabled,
    isDeletable,
    isActionable,
    accessibilityConfig,
    dataTestId,
    buttonRef,
    styleObj,
    tooltip,
}: IChipContentProps) {
    const {
        isExpanded,
        popupId,
        popupType,
        ariaHaspopup,
        ariaLabel,
        ariaLabelledBy,
        ariaControls,
        iconBeforeAriaLabel,
        iconAfterAriaLabel,
    } = accessibilityConfig ?? {};
    const tooltipId = useId();
    const isDropdownTrigger = isExpandable || isExpanded !== undefined || popupId !== undefined;
    const ariaDropdownProps = useMemo(() => {
        return isDropdownTrigger
            ? {
                  ...(popupId && isExpanded ? { "aria-controls": popupId } : {}),
                  ...(!popupId && isExpanded && ariaControls ? { "aria-controls": ariaControls } : {}),
                  ...(popupId ? { "aria-haspopup": popupType ?? ariaHaspopup ?? !!popupId } : {}),
                  ...(isExpanded === undefined
                      ? { "aria-expanded": isActive }
                      : { "aria-expanded": isExpanded }),
              }
            : {};
    }, [popupId, popupType, ariaHaspopup, ariaControls, isExpanded, isActive, isDropdownTrigger]);

    const button = useMemo(() => {
        return (
            <button
                data-testid={dataTestId}
                className={e("trigger", {
                    variant,
                    isActive,
                    isDeletable,
                    isActionable,
                    hasIconAfter: !!iconAfter,
                    isLocked: isLocked || isDisabled,
                })}
                disabled={isDisabled}
                onClick={isLocked ? undefined : onClick}
                onKeyDown={onKeyDown}
                style={{ ...styleObj }}
                ref={buttonRef}
                aria-disabled={isLocked || isDisabled}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                {...(tooltip ? { "aria-describedby": tooltipId } : {})}
                {...ariaDropdownProps}
            >
                {iconBefore ? (
                    <span className={e("icon-before")}>
                        <UiIcon
                            type={iconBefore}
                            color={iconColor}
                            size={ICON_SIZE}
                            accessibilityConfig={
                                iconBeforeAriaLabel ? { ariaLabel: iconBeforeAriaLabel } : undefined
                            }
                        />
                    </span>
                ) : null}
                <span className={e("label")}>{label}</span>
                {tag ? <span className={e("tag")}>{tag}</span> : null}
                {isDisabled ? null : (
                    <>
                        {isLocked ? (
                            <span className={e("icon-lock")}>
                                <UiIcon type="lock" color="complementary-6" size={14} />
                            </span>
                        ) : isExpandable ? (
                            <span className={e("icon-chevron", { isActive })}>
                                <UiIcon
                                    type={isActive ? "chevronUp" : "chevronDown"}
                                    color="complementary-7"
                                    size={8}
                                />
                            </span>
                        ) : iconAfter ? (
                            <span className={e("icon-after")}>
                                <UiIcon
                                    type={iconAfter}
                                    color={iconColor}
                                    size={ICON_SIZE}
                                    accessibilityConfig={
                                        iconAfterAriaLabel ? { ariaLabel: iconAfterAriaLabel } : undefined
                                    }
                                />
                            </span>
                        ) : null}
                    </>
                )}
            </button>
        );
    }, [
        iconBefore,
        iconAfter,
        dataTestId,
        ariaLabel,
        buttonRef,
        iconColor,
        ariaLabelledBy,
        iconBeforeAriaLabel,
        onKeyDown,
        isLocked,
        isDisabled,
        styleObj,
        label,
        tag,
        isExpandable,
        iconAfterAriaLabel,
        ariaDropdownProps,
        isActive,
        onClick,
        isDeletable,
        variant,
        isActionable,
        tooltip,
        tooltipId,
    ]);

    if (tooltip) {
        return (
            <UiTooltip
                inlineAnchor
                id={tooltipId}
                anchorWrapperStyles={{
                    height: "100%",
                    minWidth: 0,
                }}
                anchor={button}
                content={tooltip}
                offset={10}
                hoverOpenDelay={500}
                triggerBy={["hover", "focus"]}
            />
        );
    }

    return button;
}
