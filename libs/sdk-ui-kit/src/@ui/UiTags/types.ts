// (C) 2025 GoodData Corporation
import { IAccessibilityConfigBase } from "../../typings/accessibility.js";

/**
 * @internal
 */
export interface UiTagsProps {
    tags: Array<UiTagDef>;
    addLabel?: string;
    nameLabel?: string;
    cancelLabel?: string;
    closeLabel?: string;
    saveLabel?: string;
    moreLabel?: string;
    noTagsLabel?: string;
    removeLabel?: string;
    readOnly?: boolean;
    canCreateTag?: boolean;
    canDeleteTags?: boolean;
    mode?: "single-line" | "multi-line";
    onTagClick?: (tag: UiTagDef) => void;
    onTagAdd?: (tag: UiTagDef) => void;
    onTagRemove?: (tag: UiTagDef) => void;
    accessibilityConfig?: IAccessibilityConfigBase;
}

/**
 * @internal
 */
export interface UiTagDef {
    id: string;
    label: string;
    isDeletable?: boolean;
}
