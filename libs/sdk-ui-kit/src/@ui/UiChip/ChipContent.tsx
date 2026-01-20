// (C) 2025-2026 GoodData Corporation

import { type IChipContentProps } from "./types.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

const { e } = bem("gd-ui-kit-chip");

export function ChipContent({
    label,
    tag,
    iconBefore,
    onClick,
    onKeyDown,
    isActive,
    isLocked,
    isExpandable,
    isDisabled,
    isDeletable,
    accessibilityConfig,
    dataTestId,
    buttonRef,
    styleObj,
}: IChipContentProps) {
    const { isExpanded, popupId, popupType, ariaHaspopup, ariaLabel, ariaLabelledBy, ariaControls } =
        accessibilityConfig ?? {};
    const isDropdownTrigger = isExpandable || isExpanded !== undefined || popupId !== undefined;
    const ariaDropdownProps = isDropdownTrigger
        ? {
              ...(popupId && isExpanded ? { "aria-controls": popupId } : {}),
              ...(!popupId && isExpanded && ariaControls ? { "aria-controls": ariaControls } : {}),
              ...(popupId ? { "aria-haspopup": popupType ?? ariaHaspopup ?? !!popupId } : {}),
              ...(isExpanded === undefined ? { "aria-expanded": isActive } : { "aria-expanded": isExpanded }),
          }
        : {};

    return (
        <button
            data-testid={dataTestId}
            className={e("trigger", { isDeletable, isActive, isLocked: isLocked || isDisabled })}
            disabled={isDisabled}
            onClick={isLocked ? undefined : onClick}
            onKeyDown={onKeyDown}
            style={{ ...styleObj }}
            ref={buttonRef}
            aria-disabled={isLocked || isDisabled}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            {...ariaDropdownProps}
        >
            {iconBefore ? (
                <span className={e("icon-before")}>
                    <UiIcon type={iconBefore} color="primary" size={15} />
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
                    ) : null}
                </>
            )}
        </button>
    );
}
