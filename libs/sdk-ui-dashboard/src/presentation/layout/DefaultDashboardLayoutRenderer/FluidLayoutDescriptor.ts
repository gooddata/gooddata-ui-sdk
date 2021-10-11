// (C) 2021 GoodData Corporation
import { IFluidLayoutDescriptor } from "@gooddata/sdk-ui-ext/dist/internal/interfaces/LayoutDescriptor";
import { GRID_ROW_HEIGHT_IN_PX } from "../../constants";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../_staging/dashboard/fluidLayout";

export class FluidLayoutDescriptor implements IFluidLayoutDescriptor {
    type = "fluid" as const;
    gridColumnsCount = DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
    gridRowHeight = GRID_ROW_HEIGHT_IN_PX;

    public toGridHeight(heightPx: number): number {
        return Math.round(heightPx / this.gridRowHeight);
    }
    public toHeightInPx(height: number): number {
        return height * this.gridRowHeight;
    }
}

export const fluidLayoutDescriptor = new FluidLayoutDescriptor();
