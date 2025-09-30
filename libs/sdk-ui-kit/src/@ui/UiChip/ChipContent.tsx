// (C) 2025 GoodData Corporation

import { ChipContentProps } from "./types.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

const { e } = bem("gd-ui-kit-chip");

export function ChipContent({
    label,
    tag,
    iconBefore,
    onClick,
    isActive,
    isLocked,
    isExpandable,
    isDisabled,
    isDeletable,
    accessibilityConfig,
    dataTestId,
    buttonRef,
    styleObj,
}: ChipContentProps) {
    const { isExpanded, popupId, ariaLabel, ariaLabelledBy } = accessibilityConfig ?? {};
    const ariaDropdownProps = {
        ...(popupId && isExpanded ? { "aria-controls": popupId } : {}),
        ...(popupId ? { "aria-haspopup": !!popupId } : {}),
        ...(isExpanded === undefined ? {} : { "aria-expanded": isExpanded }),
    };

    return (
        <button
            data-testid={dataTestId}
            aria-expanded={isActive}
            className={e("trigger", { isDeletable, isActive, isLocked: isLocked || isDisabled })}
            disabled={isLocked || isDisabled}
            onClick={onClick}
            style={{ ...styleObj }}
            ref={buttonRef}
            aria-disabled={isLocked || isDisabled}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            {...ariaDropdownProps}
        >
            {iconBefore ? (
                <span className={e("icon-before")}>
                    <UiIcon type={iconBefore} color="primary" size={15} ariaHidden={true} />
                </span>
            ) : null}
            <span className={e("label")}>{label}</span>
            {tag ? <span className={e("tag")}>{tag}</span> : null}
            {isDisabled ? null : (
                <>
                    {isLocked ? (
                        <span className={e("icon-lock")}>
                            <UiIcon type="lock" color="complementary-6" size={14} ariaHidden={true} />
                        </span>
                    ) : isExpandable ? (
                        <span className={e("icon-chevron", { isActive })}>
                            <UiIcon
                                type={isActive ? "chevronUp" : "chevronDown"}
                                color="complementary-7"
                                size={8}
                                ariaHidden={true}
                            />
                        </span>
                    ) : null}
                </>
            )}
        </button>
    );
}
