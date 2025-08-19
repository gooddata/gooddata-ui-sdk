// (C) 2024-2025 GoodData Corporation

import { DataViewFacade, ExplicitDrill, OnFiredDrillEvent } from "@gooddata/sdk-ui";

import { RepeaterColumnWidthItem } from "./columnWidths.js";
import { IChartConfig } from "../../interfaces/index.js";

/**
 * @public
 */
export type RepeaterColumnResizedCallback = (columnWidths: RepeaterColumnWidthItem[]) => void;

/**
 * @public
 */
export type RepeaterDefaultColumnWidth = "unset" | "autoresizeAll" | "viewport";

/**
 * @public
 */
export interface IRepeaterColumnSizing {
    /**
     * Indicate that the table should grow to fit into the allocated space.
     *
     * @remarks
     * Default: false
     */
    growToFit?: boolean;

    /**
     * Specify whether columns should be resized to fill the entire viewport.
     *
     * @remarks
     * Default: unset
     */
    defaultWidth?: RepeaterDefaultColumnWidth;

    /**
     * Specify custom column widths to apply.
     *
     * @remarks
     * Default: none
     */
    columnWidths?: RepeaterColumnWidthItem[];
}

export interface IRepeaterChartConfig extends IChartConfig {
    /**
     * Customize column sizing strategy.
     *
     * @remarks
     * Default: none
     */
    columnSizing?: IRepeaterColumnSizing;
}

export interface IRepeaterChartProps {
    dataView: DataViewFacade;
    config?: IRepeaterChartConfig;
    onError?: (error: any) => void;

    /**
     * Specify function to call when user manually resizes a table column.
     *
     * @param columnWidths - new widths for columns
     */
    onColumnResized?: RepeaterColumnResizedCallback;

    /**
     * Configure drillability; e.g. which parts of the visualization can be interacted with.
     */
    drillableItems?: ExplicitDrill[];

    /**
     * Called when user triggers a drill on a visualization.
     */
    onDrill?: OnFiredDrillEvent;

    /**
     * Called when the repeater chart finished rendering.
     */
    afterRender?: () => void;
}
