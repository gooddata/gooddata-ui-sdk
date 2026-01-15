// (C) 2025-2026 GoodData Corporation

import { forwardRef } from "react";

import { type IUiTagDef } from "./types.js";
import { bem } from "../@utils/bem.js";
import { UiTag as UiTagComponent } from "../UiTag/UiTag.js";

const { e } = bem("gd-ui-kit-tags");

export interface IUiTagProps {
    tag: IUiTagDef;
    isDeletable: boolean;
    deleteLabel?: string;
    isReadOnly?: boolean;
    isDisabled?: boolean;
    isFocused?: boolean;
    onDelete?: (tag: IUiTagDef) => void;
    onClick?: (tag: IUiTagDef) => void;
    maxWidth?: number | "none";
}

export const UiTag = forwardRef<HTMLButtonElement, IUiTagProps>(function UiTag(
    { tag, maxWidth, isDeletable, isDisabled, isFocused, deleteLabel, onDelete, onClick }: IUiTagProps,
    ref,
) {
    const canBeDeleted = isDeletable && (tag.isDeletable ?? true);
    return (
        <div className={e("tag", { isFocused: isFocused ?? false })} role="listitem" style={{ maxWidth }}>
            <UiTagComponent
                ref={ref}
                tabIndex={-1}
                deleteTabIndex={-1}
                label={`${tag.label}`}
                isDeletable={canBeDeleted}
                isDisabled={isDisabled}
                accessibilityConfig={{
                    ariaLabel: tag.label,
                    deleteAriaLabel: `${deleteLabel ?? "Delete"} ${tag.label}`,
                }}
                onDelete={(e) => {
                    onDelete?.(tag);
                    e.stopPropagation();
                }}
                onClick={(e) => {
                    onClick?.(tag);
                    e.stopPropagation();
                }}
            />
        </div>
    );
});
