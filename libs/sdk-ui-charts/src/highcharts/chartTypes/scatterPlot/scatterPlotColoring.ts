// (C) 2020 GoodData Corporation
import { PointsChartColorStrategy } from "../_chartColoring/pointsChart.js";
import { IColorPalette } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces/index.js";
import { IColorAssignment, DataViewFacade } from "@gooddata/sdk-ui";
import { ICreateColorAssignmentReturnValue } from "@gooddata/sdk-ui-vis-commons";

export class ScatterPlotColorStrategy extends PointsChartColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        _viewByAttribute: any,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        _stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        const colorAssignment = this.singleMeasureColorMapping(colorPalette, colorMapping, dv);
        return {
            fullColorAssignment: colorAssignment,
        };
    }

    protected createPalette(
        colorPalette: IColorPalette,
        colorAssignment: IColorAssignment[],
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        _viewByAttribute: any,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        stackByAttribute: any,
    ): string[] {
        return super.createSingleColorPalette(colorPalette, colorAssignment, stackByAttribute);
    }
}
