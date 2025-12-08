// (C) 2019-2025 GoodData Corporation

import { ReactNode, memo, useCallback, useEffect } from "react";

import { Overlay } from "@gooddata/sdk-ui-kit";

export enum DropdownVersionType {
    ColorPalette,
    ColorPicker,
}

export interface IColorOverlayProps {
    alignTo: string;
    dropdownVersion: DropdownVersionType;
    onClose: () => void;
    children?: ReactNode;
}

const ALIGN_POINTS_COLOR_PALETTE_PICKER = [
    {
        align: "bl tl",
        offset: {
            x: 0,
            y: 2,
        },
    },
    {
        align: "tl bl",
        offset: {
            x: 0,
            y: 2,
        },
    },
];

const ALIGN_POINTS_CUSTOM_COLOR_PICKER = [
    {
        align: "cr cl",
        offset: {
            x: 5,
            y: 0,
        },
    },
    {
        align: "br bl",
        offset: {
            x: 5,
            y: 100,
        },
    },
    {
        align: "br bl",
        offset: {
            x: 5,
            y: 0,
        },
    },
];

export const ColorOverlay = memo(function ColorOverlay({
    alignTo,
    dropdownVersion,
    onClose: onCloseProp,
    children,
}: IColorOverlayProps) {
    const stopPropagation = useCallback((e: WheelEvent) => {
        e.stopPropagation();
    }, []);

    const stopScrollingPropagation = useCallback(() => {
        document.body.addEventListener("wheel", stopPropagation);
    }, [stopPropagation]);

    const startScrollingPropagation = useCallback(() => {
        document.body.removeEventListener("wheel", stopPropagation);
    }, [stopPropagation]);

    useEffect(() => {
        return () => {
            startScrollingPropagation();
        };
    }, [startScrollingPropagation]);

    const getAlignPoints = useCallback(() => {
        if (dropdownVersion === DropdownVersionType.ColorPalette) {
            return ALIGN_POINTS_COLOR_PALETTE_PICKER;
        }

        return ALIGN_POINTS_CUSTOM_COLOR_PICKER;
    }, [dropdownVersion]);

    const onClose = useCallback(() => {
        onCloseProp();
    }, [onCloseProp]);

    return (
        <Overlay
            alignTo={alignTo}
            onClose={onClose}
            alignPoints={getAlignPoints()}
            closeOnOutsideClick
            closeOnParentScroll
            closeOnMouseDrag
        >
            <div
                onMouseOver={stopScrollingPropagation}
                onMouseOut={startScrollingPropagation}
                aria-label="Color overlay content"
            >
                {children}
            </div>
        </Overlay>
    );
});
