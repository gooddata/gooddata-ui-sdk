// (C) 2025 GoodData Corporation
import React from "react";
import { typedUiMenuContextStore } from "../context.js";
import { IUiMenuItemProps, IUiMenuItemData } from "../types.js";

export const ItemComponent = React.memo(function ItemComponent<T extends IUiMenuItemData = object>({
    item,
}: IUiMenuItemProps<T>) {
    const {
        InteractiveItemWrapperComponent,
        StaticItemComponent,
        GroupItemComponent,
        ContentItemWrapperComponent,
    } = typedUiMenuContextStore<T>().useContextStore((ctx) => ({
        InteractiveItemWrapperComponent: ctx.InteractiveItemWrapper,
        StaticItemComponent: ctx.StaticItem,
        GroupItemComponent: ctx.GroupItem,
        ContentItemComponent: ctx.ContentItem,
        ContentItemWrapperComponent: ctx.ContentItemWrapper,
    }));

    if (item.type === "interactive") {
        return <InteractiveItemWrapperComponent item={item} />;
    }
    if (item.type === "static") {
        return <StaticItemComponent item={item} />;
    }
    if (item.type === "group") {
        return <GroupItemComponent item={item} />;
    }
    if (item.type === "content") {
        return <ContentItemWrapperComponent item={item} />;
    }
    return null;
});
