// (C) 2024-2025 GoodData Corporation

import React, { CSSProperties, MouseEventHandler, forwardRef } from "react";
import cx from "classnames";
import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { CommonExportDataAttributes } from "../../export/index.js";

import { useWidthValidation } from "./useItemWidthValidation.js";

export type LayoutElementType = "root" | "nested" | "section" | "item" | "leaf-item";

const getElementClassName = (type: LayoutElementType, gridWidth: number) => {
    switch (type) {
        case "root":
            return "gd-grid-layout__container--root";
        case "nested":
            return `gd-grid-layout__container--nested gd-grid-layout__container--nested--width-${gridWidth}`;
        case "section":
            return "gd-grid-layout__section";
        case "leaf-item":
            return "gd-grid-layout__item gd-grid-layout__item--leaf";
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

    /**
     * Data for export in export mode.
     */
    exportData?: CommonExportDataAttributes;

    /**
     * Export styles for export mode.
     */
    exportStyles?: CSSProperties;
}

export const GridLayoutElement = forwardRef<HTMLDivElement, IGridLayoutElementProps>(
    ({ children, className, style, type, layoutItemSize, onMouseLeave, exportData, exportStyles }, ref) => {
        // Fix item width locally if it is bigger than parent width to prevent css-gird render issues.
        // Error is fired on DashboardLayoutWidget with more details.
        const { validWidth } = useWidthValidation(layoutItemSize);

        const classNames = cx(
            getElementClassName(type, validWidth),
            `gd-grid-layout__item--span-${validWidth}`, // CSS Grid columns size class name
            className,
        );
        const sanitizedStyle = {
            ...style,
            ...exportStyles,
        };

        return type === "section" ? (
            <section
                className={classNames}
                style={sanitizedStyle}
                onMouseLeave={onMouseLeave}
                ref={ref}
                {...exportData}
            >
                <div className={"gd-fluidlayout-row s-fluid-layout-row"} style={{ display: "contents" }}>
                    {children}
                </div>
            </section>
        ) : (
            <div
                className={classNames}
                style={sanitizedStyle}
                onMouseLeave={onMouseLeave}
                ref={ref}
                {...exportData}
            >
                {children}
            </div>
        );
    },
);

GridLayoutElement.displayName = "GridLayoutElement";
