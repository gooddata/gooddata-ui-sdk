// (C) 2025-2026 GoodData Corporation

import { memo } from "react";

import { typedUiMenuContextStore } from "../context.js";
import { type IUiMenuItemProps } from "../types.js";

import { MenuDivider } from "./MenuDivider.js";

export const Item = memo<IUiMenuItemProps>(function Item({ item }) {
    const { InteractiveItemWrapper, StaticItem, GroupItem, ContentItemWrapper } =
        typedUiMenuContextStore().useContextStoreValues([
            "InteractiveItemWrapper",
            "StaticItem",
            "GroupItem",
            "ContentItemWrapper",
        ]);

    if (item.type === "interactive") {
        return <InteractiveItemWrapper item={item} />;
    }
    if (item.type === "static") {
        return <StaticItem item={item} />;
    }
    if (item.type === "separator") {
        return (
            <li role="separator">
                <MenuDivider />
            </li>
        );
    }
    if (item.type === "group") {
        return <GroupItem item={item} />;
    }
    if (item.type === "content") {
        return <ContentItemWrapper item={item} />;
    }
    return null;
});
