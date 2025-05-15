// (C) 2025 GoodData Corporation
import React from "react";
import { typedUiMenuContextStore } from "../context.js";
import { UiMenuItemProps, IUiMenuItemData } from "../types.js";

export const ItemComponent = React.memo(function ItemComponent<T extends IUiMenuItemData = object>({
    item,
}: UiMenuItemProps<T>) {
    const {
        InteractiveItemWrapperComponent,
        StaticItemComponent,
        GroupItemComponent,
        ContentItemWrapperComponent,
    } = typedUiMenuContextStore<T>().useContextStore((ctx) => ({
        InteractiveItemWrapperComponent: ctx.InteractiveItemWrapperComponent,
        StaticItemComponent: ctx.StaticItemComponent,
        GroupItemComponent: ctx.GroupItemComponent,
        ContentItemComponent: ctx.ContentItemComponent,
        ContentItemWrapperComponent: ctx.ContentItemWrapperComponent,
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
