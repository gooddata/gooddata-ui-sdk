// (C) 2019-2025 GoodData Corporation
import React, { memo, useEffect, useRef } from "react";

import cx from "classnames";

import { IColor, IColorFromPalette, IColorPaletteItem } from "@gooddata/sdk-model";

const ITEM_MARGIN = 5;

export interface IColorPaletteItemProps {
    selected: boolean;
    paletteItem: IColorPaletteItem;
    onColorSelected: (color: IColor) => void;
}

const ColorPaletteItem = memo(function ColorPaletteItem({
    selected,
    paletteItem,
    onColorSelected,
}: IColorPaletteItemProps) {
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scrollSelectedItemIntoParent = () => {
            if (selected && itemRef.current?.parentNode && isItemVisible()) {
                const target = itemRef.current;
                const parentNode = target.parentNode as HTMLElement;
                parentNode.scrollTop = target.offsetTop - parentNode.offsetTop - ITEM_MARGIN;
            }
        };

        const isItemVisible = () => {
            const target = itemRef.current;
            if (!target?.parentNode) return false;
            const parentNode = target.parentNode as HTMLElement;
            const offset = target.offsetTop - parentNode.offsetTop;
            const itemHeight = target.clientHeight;
            const parentHeight = parentNode.clientHeight;

            return parentHeight < offset + itemHeight;
        };

        scrollSelectedItemIntoParent();
    }, [selected]);

    const getClassNames = () => {
        return cx("gd-color-list-item", `s-color-list-item-${paletteItem.guid}`, {
            "gd-color-list-item-active": selected,
        });
    };

    const getRgbStringFromPaletteItem = () => {
        const { r, g, b } = paletteItem.fill;
        return `rgb(${r},${g},${b})`;
    };

    const handleColorSelected = () => {
        const selectedItem: IColorFromPalette = {
            type: "guid",
            value: paletteItem.guid,
        };

        onColorSelected(selectedItem);
    };

    return (
        <div
            aria-label={getRgbStringFromPaletteItem()}
            ref={itemRef}
            onClick={handleColorSelected}
            style={{
                backgroundColor: getRgbStringFromPaletteItem(),
            }}
            className={getClassNames()}
        />
    );
});

export default ColorPaletteItem;
