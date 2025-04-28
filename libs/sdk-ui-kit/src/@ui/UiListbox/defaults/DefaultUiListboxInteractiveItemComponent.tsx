// (C) 2025 GoodData Corporation

import React from "react";
import { e } from "../listboxBem.js";
import { ShortenedText } from "../../../ShortenedText/index.js";
import { UiListboxInteractiveItemProps } from "../types.js";

/**
 * @internal
 */
export function DefaultUiListboxInteractiveItemComponent<T>({
    item,
    isFocused,
    isSelected,
    onSelect,
}: UiListboxInteractiveItemProps<T>): React.ReactNode {
    return (
        <div
            className={e("item", {
                isFocused,
                isSelected,
                isDisabled: !!item.isDisabled,
            })}
            onClick={item.isDisabled ? undefined : onSelect}
        >
            <ShortenedText className={e("item-title")} ellipsisPosition={"end"}>
                {item.stringTitle}
            </ShortenedText>
        </div>
    );
}
