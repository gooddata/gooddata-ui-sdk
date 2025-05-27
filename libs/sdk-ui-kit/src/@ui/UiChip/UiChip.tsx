// (C) 2025 GoodData Corporation

import React, { CSSProperties, useLayoutEffect, useRef, useState } from "react";
import { IDropdownButtonAccessibilityConfig } from "../../Button/typings.js";
import { IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

/**
 * @internal
 */
export interface IUiChipAccessibilityConfig
    extends IAccessibilityConfigBase,
        IDropdownButtonAccessibilityConfig {
    deleteAriaLabel?: string;
}

/**
 * @internal
 */
export interface UiChipProps {
    label: string;
    tag?: string;
    isDeletable?: boolean;
    isActive?: boolean;
    isLocked?: boolean;
    iconBefore?: IconType;
    onClick?: () => void;
    onDelete?: () => void;
    onDeleteKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
    accessibilityConfig?: IUiChipAccessibilityConfig;
    dataTestId?: string;
}

const { b, e } = bem("gd-ui-kit-chip");

/**
 * @internal
 */
export const UiChip = ({
    label,
    tag,
    isDeletable = false,
    isActive = false,
    isLocked = false,
    iconBefore,
    onClick,
    onDelete,
    onDeleteKeyDown,
    accessibilityConfig,
    dataTestId,
}: UiChipProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [styleObj, setStyleObj] = useState<CSSProperties>();

    useLayoutEffect(() => {
        if (buttonRef.current) {
            // Reset width to auto to calculate the width of the label and tag
            buttonRef.current.style.width = "auto";
            const width = buttonRef.current.getBoundingClientRect().width;
            setStyleObj({ width });
        }
    }, [label, tag]);

    const { isExpanded, popupId, ariaLabel, ariaLabelledBy, deleteAriaLabel } = accessibilityConfig ?? {};
    const ariaDropdownProps = {
        ...(popupId && isExpanded ? { "aria-controls": popupId } : {}),
        ...(popupId ? { "aria-haspopup": !!popupId } : {}),
        ...(isExpanded !== undefined ? { "aria-expanded": isExpanded } : {}),
    };

    return (
        <div className={b()}>
            <button
                data-testid={dataTestId}
                aria-expanded={isActive}
                className={e("trigger", { isDeletable, isActive, isLocked })}
                disabled={isLocked}
                onClick={onClick}
                style={{ ...styleObj }}
                ref={buttonRef}
                aria-disabled={isLocked}
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
                {isLocked ? (
                    <span className={e("icon-lock")}>
                        <UiIcon type="lock" color="complementary-6" size={14} ariaHidden={true} />
                    </span>
                ) : (
                    <span className={e("icon-chevron", { isActive })}>
                        <UiIcon
                            type={isActive ? "chevronUp" : "chevronDown"}
                            color="complementary-7"
                            size={8}
                            ariaHidden={true}
                        />
                    </span>
                )}
            </button>
            {isDeletable ? (
                <button
                    data-testid={dataTestId ? `${dataTestId}-delete-button` : undefined}
                    aria-label={deleteAriaLabel}
                    className={e("delete")}
                    onClick={onDelete}
                    onKeyDown={onDeleteKeyDown}
                >
                    <span className={e("icon-delete")}>
                        <UiIcon type="cross" color="complementary-6" size={14} ariaHidden={true} />
                    </span>
                </button>
            ) : null}
        </div>
    );
};
