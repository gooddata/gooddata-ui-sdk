// (C) 2025 GoodData Corporation

import { e } from "./treeviewBem.js";
import type { UiStaticTreeView, UiTreeviewAriaAttributes } from "./types.js";
import { makeItemId } from "./utils.js";

/**
 * @internal
 */
interface UiTreeviewRootProps {
    children?: React.ReactNode;
    focusedItem?: UiStaticTreeView<unknown>;
    handleKeyDown: (event: React.KeyboardEvent) => void;
    ariaAttributes: UiTreeviewAriaAttributes;
}

/**
 * @internal
 */
export function UiTreeviewRoot(props: UiTreeviewRootProps) {
    const { handleKeyDown, children, ariaAttributes, focusedItem } = props;
    return (
        <div
            className={e("root")}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            role="tree"
            aria-activedescendant={makeItemId(ariaAttributes.id, focusedItem)}
            {...ariaAttributes}
        >
            {children}
        </div>
    );
}
