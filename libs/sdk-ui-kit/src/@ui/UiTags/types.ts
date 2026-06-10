// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { type IconType } from "../@types/icon.js";

/**
 * @internal
 */
export interface IUiTagsProps {
    tags: Array<IUiTagDef>;
    tagOptions?: Array<IUiTagDef>;
    addLabel?: string;
    nameLabel?: string;
    cancelLabel?: string;
    closeLabel?: string;
    saveLabel?: string;
    moreLabel?: string;
    noTagsLabel?: string;
    removeLabel?: string;
    creatableLabel?: string;
    readOnly?: boolean;
    canCreateTag?: boolean;
    canDeleteTags?: boolean;
    mode?: "single-line" | "multi-line";
    /** Visual size of the rendered tags. Defaults to "small". */
    size?: "small" | "large";
    onTagClick?: (tag: IUiTagDef) => void;
    onTagAdd?: (tag: IUiTagDef) => void;
    onTagRemove?: (tag: IUiTagDef) => void;
    accessibilityConfig?: IAccessibilityConfigBase;
    /**
     * Renders custom content in the add-button slot — the last item in the tags row,
     * in-flow with the tags so it sits right after them (and the "+N" overflow chip)
     * and is included in the responsive overflow measurement. When provided, it
     * replaces the built-in create-tag combobox; use it to host a bespoke picker
     * while keeping the tag display and overflow behaviour. Ignored when readOnly.
     */
    renderAddButton?: () => ReactNode;
}

/**
 * @internal
 */
export interface IUiTagDef {
    id: string;
    label: string;
    isDeletable?: boolean;
    iconBefore?: IconType;
}
