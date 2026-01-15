// (C) 2025-2026 GoodData Corporation

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";

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
    onTagClick?: (tag: IUiTagDef) => void;
    onTagAdd?: (tag: IUiTagDef) => void;
    onTagRemove?: (tag: IUiTagDef) => void;
    accessibilityConfig?: IAccessibilityConfigBase;
}

/**
 * @internal
 */
export interface IUiTagDef {
    id: string;
    label: string;
    isDeletable?: boolean;
}
