// (C) 2021 GoodData Corporation
import { IFluidLayoutDescriptor } from "../../interfaces/LayoutDescriptor";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT, GRID_ROW_HEIGHT_IN_PX } from "./constants";

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
