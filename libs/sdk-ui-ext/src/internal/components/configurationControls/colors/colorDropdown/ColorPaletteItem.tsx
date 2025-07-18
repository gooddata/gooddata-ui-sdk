// (C) 2019-2025 GoodData Corporation
import { memo, useRef, useEffect } from "react";
import { IColor, IColorFromPalette, IColorPaletteItem } from "@gooddata/sdk-model";
import cx from "classnames";

const ITEM_MARGIN = 5;

export interface IColorPaletteItemProps {
    selected: boolean;
    paletteItem: IColorPaletteItem;
    onColorSelected: (color: IColor) => void;
}

export const ColorPaletteItem = memo(function ColorPaletteItem(props: IColorPaletteItemProps) {
    const itemRef = useRef<any>(undefined);

    useEffect(() => {
        scrollSelectedItemIntoParent();
    });

    const scrollSelectedItemIntoParent = () => {
        if (props.selected && itemRef.current?.parentNode && isItemVisible()) {
            const target = itemRef.current;
            target.parentNode.scrollTop = target.offsetTop - target.parentNode.offsetTop - ITEM_MARGIN;
        }
    };

    const isItemVisible = () => {
        const target = itemRef.current;
        const offset = target.offsetTop - target.parentNode.offsetTop;
        const itemHeight = target.clientHeight;
        const parentHeight = target.parentNode.clientHeight;

        return parentHeight < offset + itemHeight;
    };

    const getClassNames = () => {
        return cx("gd-color-list-item", `s-color-list-item-${props.paletteItem.guid}`, {
            "gd-color-list-item-active": props.selected,
        });
    };

    const getRgbStringFromPaletteItem = () => {
        const { r, g, b } = props.paletteItem.fill;
        return `rgb(${r},${g},${b})`;
    };

    const onColorSelected = () => {
        const selectedItem: IColorFromPalette = {
            type: "guid",
            value: props.paletteItem.guid,
        };

        props.onColorSelected(selectedItem);
    };

    return (
        <div
            aria-label={getRgbStringFromPaletteItem()}
            ref={itemRef}
            onClick={onColorSelected}
            style={{
                backgroundColor: getRgbStringFromPaletteItem(),
            }}
            className={getClassNames()}
        />
    );
});

export default ColorPaletteItem;
