// (C) 2025 GoodData Corporation

import { type CSSProperties, useLayoutEffect, useRef, useState } from "react";

import { ChipContent } from "./ChipContent.js";
import { ChipDeleteButton } from "./ChipDeleteButton.js";
import { type UiChipProps } from "./types.js";
import { bem } from "../@utils/bem.js";

const { b } = bem("gd-ui-kit-chip");

/**
 * @internal
 */
export function UiChip({
    label,
    tag,
    isDeletable = false,
    isActive = false,
    isLocked = false,
    isExpandable = true,
    isDisabled = false,
    maxWidth,
    iconBefore,
    onClick,
    onDelete,
    onKeyDown,
    onDeleteKeyDown,
    accessibilityConfig,
    dataTestId,
    buttonRef,
    renderChipContent,
    renderDeleteButton,
}: UiChipProps) {
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

    const { deleteAriaLabel, deleteAriaDescribedBy } = accessibilityConfig ?? {};

    const chipContent = (
        <ChipContent
            label={label}
            tag={tag}
            iconBefore={iconBefore}
            onClick={onClick}
            onKeyDown={onKeyDown}
            isActive={isActive}
            isLocked={isLocked}
            isExpandable={isExpandable}
            isDisabled={isDisabled}
            isDeletable={isDeletable}
            maxWidth={maxWidth}
            accessibilityConfig={accessibilityConfig}
            dataTestId={dataTestId}
            buttonRef={effectiveButtonRef}
            styleObj={styleObj}
        />
    );

    const deleteButton = isDeletable ? (
        <ChipDeleteButton
            onDelete={onDelete}
            onDeleteKeyDown={onDeleteKeyDown}
            deleteAriaLabel={deleteAriaLabel}
            deleteAriaDescribedBy={deleteAriaDescribedBy}
            dataTestId={dataTestId}
        />
    ) : null;

    return (
        <div className={b()} style={{ maxWidth }}>
            {renderChipContent ? renderChipContent(chipContent) : chipContent}
            {deleteButton && renderDeleteButton ? renderDeleteButton(deleteButton) : deleteButton}
        </div>
    );
}
