// (C) 2025-2026 GoodData Corporation

import { type CSSProperties, useLayoutEffect, useRef, useState } from "react";

import { bem } from "../@utils/bem.js";

import { ChipActionButton } from "./ChipActionButton.js";
import { ChipContent } from "./ChipContent.js";
import { ChipDeleteButton } from "./ChipDeleteButton.js";
import { type IUiChipProps } from "./types.js";

const { b } = bem("gd-ui-kit-chip");

/**
 * @internal
 */
export function UiChip({
    label,
    tag,
    isDeletable = false,
    isActionable = false,
    isActive = false,
    isLocked = false,
    isExpandable = true,
    isDisabled = false,
    maxWidth,
    iconBefore,
    iconAfter,
    iconColor = "primary",
    onClick,
    onKeyDown,
    onDelete,
    onDeleteKeyDown,
    onAction,
    onActionKeyDown,
    accessibilityConfig,
    dataTestId,
    buttonRef,
    iconAction,
    variant = "normal",
    renderChipContent,
    renderActionButton,
}: IUiChipProps) {
    const [styleObj, setStyleObj] = useState<CSSProperties>();
    const defaultButtonRef = useRef<HTMLButtonElement>(null);
    const effectiveButtonRef = buttonRef || defaultButtonRef;

    useLayoutEffect(() => {
        if (effectiveButtonRef.current) {
            // Reset width to auto to calculate the width of the label and tag
            effectiveButtonRef.current.style.width = "auto";
            const width = effectiveButtonRef.current.getBoundingClientRect().width;
            setStyleObj({ width });
        }
    }, [label, tag, effectiveButtonRef]);

    const { deleteAriaLabel, deleteAriaDescribedBy, actionAriaLabel, actionAriaDescribedBy } =
        accessibilityConfig ?? {};

    const chipContent = (
        <ChipContent
            label={label}
            tag={tag}
            variant={variant}
            iconBefore={iconBefore}
            iconAfter={iconAfter}
            iconColor={iconColor}
            onClick={onClick}
            onKeyDown={onKeyDown}
            isActive={isActive}
            isLocked={isLocked}
            isExpandable={isExpandable}
            isDisabled={isDisabled}
            isDeletable={isDeletable}
            isActionable={isActionable}
            maxWidth={maxWidth}
            accessibilityConfig={accessibilityConfig}
            dataTestId={dataTestId}
            buttonRef={effectiveButtonRef}
            styleObj={styleObj}
        />
    );

    const actionButton = isDeletable ? (
        <ChipDeleteButton
            onDelete={onDelete}
            onDeleteKeyDown={onDeleteKeyDown}
            deleteAriaLabel={deleteAriaLabel}
            deleteAriaDescribedBy={deleteAriaDescribedBy}
            dataTestId={dataTestId}
        />
    ) : isActionable ? (
        <ChipActionButton
            onAction={onAction}
            onActionKeyDown={onActionKeyDown}
            actionIcon={iconAction}
            actionAriaLabel={actionAriaLabel}
            actionAriaDescribedBy={actionAriaDescribedBy}
            dataTestId={dataTestId}
        />
    ) : null;

    return (
        <div
            className={b({
                variant,
            })}
            style={{ maxWidth }}
        >
            {renderChipContent ? renderChipContent(chipContent) : chipContent}
            {actionButton && renderActionButton ? renderActionButton(actionButton) : actionButton}
        </div>
    );
}
