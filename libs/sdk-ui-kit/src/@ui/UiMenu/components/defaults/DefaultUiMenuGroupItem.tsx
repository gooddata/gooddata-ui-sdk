// (C) 2025 GoodData Corporation

import React from "react";
import { e } from "../../menuBem.js";
import { ShortenedText } from "../../../../ShortenedText/index.js";
import { IUiMenuItemData, IUiMenuGroupItemProps } from "../../types.js";
import { typedUiMenuContextStore } from "../../context.js";
import { SeparatorLine } from "../../../../SeparatorLine/SeparatorLine.js";
/**
 * @internal
 */
export function DefaultUiMenuGroupItem<T extends IUiMenuItemData = object>({
    item,
}: IUiMenuGroupItemProps<T>): React.ReactNode {
    const { createSelector, useContextStore } = typedUiMenuContextStore<T>();
    const selector = createSelector((ctx) => ({
        makeItemId: ctx.makeItemId,
        ItemComponent: ctx.ItemComponent,
    }));

    const { makeItemId, ItemComponent } = useContextStore(selector);

    const menuGroupItemId = makeItemId(item);

    return (
        <ul className={e("group")} role={"group"} aria-labelledby={menuGroupItemId}>
            <li className={e("group-title-container")} role={"presentation"} id={menuGroupItemId}>
                <ShortenedText className={e("group-title")} ellipsisPosition={"end"}>
                    {item.stringTitle}
                </ShortenedText>
                <div className={e("group-separator")} role={"presentation"}>
                    <SeparatorLine mL={10} />
                </div>
            </li>

            {item.subItems.map((groupItem, index) => (
                <ItemComponent key={"id" in groupItem ? groupItem.id : index} item={groupItem} />
            ))}
        </ul>
    );
}
