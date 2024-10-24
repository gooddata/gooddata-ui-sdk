// (C) 2024 GoodData Corporation

import React, { CSSProperties, MouseEventHandler, forwardRef } from "react";
import cx from "classnames";
import { ScreenSize } from "@gooddata/sdk-model";

import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/fluidLayout/index.js";

import { determineSizeForScreenFromSizingLayoutItem } from "./utils/sizing.js";

const ENABLE_DEBUG_MODE = false;

export type LayoutElementType = "root" | "nested" | "section" | "item";

const getBubbleDebugClassName = (type: LayoutElementType) => {
    switch (type) {
        case "root":
            return "gd-grid-layout__debug--root";
        case "nested":
            return "gd-grid-layout__debug--nested";
        case "section":
            return "gd-grid-layout__debug--section";
        case "item":
        default:
            return "gd-grid-layout__debug--item";
    }
};

const getElementDebugClassName = (type: LayoutElementType) => {
    switch (type) {
        case "root":
            return "gd-grid-layout__root--debug";
        case "nested":
            return "gd-grid-layout__nested--debug";
        case "section":
            return "gd-grid-layout__section--debug";
        case "item":
        default:
            return "gd-grid-layout__item--debug";
    }
};

const getElementClassName = (type: LayoutElementType) => {
    switch (type) {
        case "root":
            return "gd-grid-layout__root";
        case "nested":
            return "gd-grid-layout__nested";
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
     * The current scree size.
     */
    screen: ScreenSize;
    /**
     * Element from which the width of the rendered element is taken.
     */
    sizingLayoutItem?: IDashboardLayoutItemFacade<unknown>;
    /**
     * Enable to render debugging information about the element.
     */
    debug?: boolean;
    /**
     * Callback called when mouse leave the element.
     */
    onMouseLeave?: MouseEventHandler;
}

export const GridLayoutElement = forwardRef<HTMLDivElement, IGridLayoutElementProps>(
    ({ children, className, style, type, sizingLayoutItem, screen, onMouseLeave }, ref) => {
        const gridWidth = determineSizeForScreenFromSizingLayoutItem(screen, sizingLayoutItem);
        const classNames = cx(
            className,
            getElementClassName(type),
            `gd-grid-layout__item--span-${gridWidth}`, // CSS Grid columns size class name
            {
                [getElementDebugClassName(type)]: ENABLE_DEBUG_MODE,
            },
        );

        return (
            <div className={classNames} style={style} onMouseLeave={onMouseLeave} ref={ref}>
                {ENABLE_DEBUG_MODE ? (
                    <div className={cx("gd-grid-layout__debug", getBubbleDebugClassName(type))}>
                        {gridWidth} {screen}
                    </div>
                ) : null}
                {children}
            </div>
        );
    },
);

GridLayoutElement.displayName = "GridLayoutElement";
