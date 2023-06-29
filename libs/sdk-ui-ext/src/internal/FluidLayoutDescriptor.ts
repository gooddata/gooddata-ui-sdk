// (C) 2021 GoodData Corporation
import { IFluidLayoutDescriptor } from "./interfaces/LayoutDescriptor.js";

// keep in sync with sdk-ui-dashboard
const DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT = 12;
const GRID_ROW_HEIGHT_IN_PX = 20;

/**
 * @alpha
 */
export class FluidLayoutDescriptor implements IFluidLayoutDescriptor {
    type: "fluid";
    gridColumnsCount = DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
    gridRowHeight = GRID_ROW_HEIGHT_IN_PX;

    public toGridHeight(heightPx: number): number {
        return Math.round(heightPx / this.gridRowHeight);
    }
    public toHeightInPx(height: number): number {
        return height * this.gridRowHeight;
    }
}

/**
 * @alpha
 */
export const fluidLayoutDescriptor = new FluidLayoutDescriptor();
