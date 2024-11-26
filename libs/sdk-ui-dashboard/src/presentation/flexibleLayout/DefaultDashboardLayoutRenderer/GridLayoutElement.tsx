// (C) 2024 GoodData Corporation

import React, { CSSProperties, MouseEventHandler, forwardRef } from "react";
import cx from "classnames";
import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";

import { determineWidthForScreen } from "../../../_staging/layout/sizing.js";

export type LayoutElementType = "root" | "nested" | "section" | "item";

const getElementClassName = (type: LayoutElementType, gridWidth: number) => {
    switch (type) {
        case "root":
            return "gd-grid-layout__container--root";
        case "nested":
            return `gd-grid-layout__container--nested gd-grid-layout__container--nested--width-${gridWidth}`;
        case "section":
            return "gd-grid-layout__section";
        case "item":
        default:
            return "gd-grid-layout__item";
    }
};

export interface IGridLayoutElementProps {
    /**
     * Type of grid element.
     */
    type: LayoutElementType;
    /**
     * Element children renderer inside of the element.
     */
    children: React.ReactNode;
    /**
     * Optional class name set on the element.
     */
    className?: string;
    /**
     * Optional style set on the element, used for quick hiding of the element from layout.
     */
    style?: CSSProperties | undefined;
    /**
     * The sizes of the grid element per each supported screen size.
     */
    layoutItemSize?: IDashboardLayoutSizeByScreenSize;
    /**
     * Callback called when mouse leave the element.
     */
    onMouseLeave?: MouseEventHandler;
}

export const GridLayoutElement = forwardRef<HTMLDivElement, IGridLayoutElementProps>(
    ({ children, className, style, type, layoutItemSize, onMouseLeave }, ref) => {
        const screen = useScreenSize();
        const gridWidth = determineWidthForScreen(screen, layoutItemSize);
        const classNames = cx(
            getElementClassName(type, gridWidth),
            `gd-grid-layout__item--span-${gridWidth}`, // CSS Grid columns size class name
            className,
        );

        return (
            <div className={classNames} style={style} onMouseLeave={onMouseLeave} ref={ref}>
                {children}
            </div>
        );
    },
);

GridLayoutElement.displayName = "GridLayoutElement";
