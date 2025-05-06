// (C) 2025 GoodData Corporation

import React from "react";
import { e } from "../menuBem.js";
import { ShortenedText } from "../../../ShortenedText/index.js";
import { UiMenuInteractiveItemProps } from "../types.js";

/**
 * @internal
 */
export function DefaultUiMenuInteractiveItemComponent<InteractiveItemData, StaticItemData>({
    item,
    isFocused,
    onSelect,
}: UiMenuInteractiveItemProps<InteractiveItemData, StaticItemData>): React.ReactNode {
    return (
        <div
            className={e("item", {
                isFocused,
                isDisabled: !!item.isDisabled,
            })}
            onClick={item.isDisabled ? undefined : onSelect}
        >
            <ShortenedText className={e("item-title")} ellipsisPosition={"end"}>
                {item.stringTitle}
            </ShortenedText>

            {!!item.subMenu && <i className="gd-icon-navigateright" />}
        </div>
    );
}
