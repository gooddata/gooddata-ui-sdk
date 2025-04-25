// (C) 2025 GoodData Corporation

import React from "react";
import { Separator } from "../../../List/index.js";
import { e } from "../listboxBem.js";
import { ShortenedText } from "../../../ShortenedText/index.js";
import { v4 as uuid } from "uuid";
import { IUiListboxItem, UiListboxItemProps } from "../types.js";

/**
 * @internal
 */
export const separatorItemSymbol = Symbol("separator");

/**
 * @internal
 */
export const makeSeparatorItem = (): IUiListboxItem<typeof separatorItemSymbol> => ({
    id: `separator-${uuid()}`,
    data: separatorItemSymbol,
    stringTitle: "Separator",
    isDisabled: true,
});

/**
 * @internal
 */
export function DefaultUiListboxItemComponent<T>({
    item,
    isFocused,
    isSelected,
    onSelect,
}: UiListboxItemProps<T>): React.ReactNode {
    return item.data === separatorItemSymbol ? (
        <Separator />
    ) : (
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
