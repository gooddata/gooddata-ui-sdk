// (C) 2025 GoodData Corporation

import { memo } from "react";

import { typedUiMenuContextStore } from "../context.js";
import { IUiMenuItemData, IUiMenuItemProps } from "../types.js";

export const Item = memo(function Item<T extends IUiMenuItemData = object>({ item }: IUiMenuItemProps<T>) {
    const { InteractiveItemWrapper, StaticItem, GroupItem, ContentItemWrapper } =
        typedUiMenuContextStore<T>().useContextStoreValues([
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
    if (item.type === "group") {
        return <GroupItem item={item} />;
    }
    if (item.type === "content") {
        return <ContentItemWrapper item={item} />;
    }
    return null;
});
