// (C) 2025-2026 GoodData Corporation

import { forwardRef } from "react";

import { bem } from "../@utils/bem.js";
import { UiTag as UiTagComponent } from "../UiTag/UiTag.js";

import { type IUiTagDef } from "./types.js";

const { e } = bem("gd-ui-kit-tags");

export interface IUiTagProps {
    tag: IUiTagDef;
    isDeletable: boolean;
    deleteLabel?: string;
    isDisabled?: boolean;
    size?: "small" | "large";
    onDelete?: (tag: IUiTagDef) => void;
    onClick?: (tag: IUiTagDef) => void;
    maxWidth?: number | "none";
}

export const UiTag = forwardRef<HTMLButtonElement, IUiTagProps>(function UiTag(
    { tag, maxWidth, isDeletable, isDisabled, size, deleteLabel, onDelete, onClick }: IUiTagProps,
    ref,
) {
    const canBeDeleted = isDeletable && (tag.isDeletable ?? true);
    const isClickable = onClick !== undefined;
    return (
        <div
            className={e("tag")}
            style={{ maxWidth }}
            data-tag-id={tag.id}
            tabIndex={-1}
            aria-label={tag.label}
        >
            <UiTagComponent
                ref={isClickable ? ref : undefined}
                labelAs={isClickable ? "button" : "span"}
                label={`${tag.label}`}
                size={size}
                iconBefore={tag.iconBefore}
                isDeletable={canBeDeleted}
                isDisabled={isDisabled}
                accessibilityConfig={{
                    ariaLabel: tag.label,
                    deleteAriaLabel: `${deleteLabel ?? "Delete"} ${tag.label}`,
                }}
                onDelete={
                    canBeDeleted
                        ? (e) => {
                              onDelete?.(tag);
                              e.stopPropagation();
                          }
                        : undefined
                }
                onClick={
                    isClickable
                        ? (e) => {
                              onClick(tag);
                              e.stopPropagation();
                          }
                        : undefined
                }
            />
        </div>
    );
});
