// (C) 2020 GoodData Corporation
import { PointsChartColorStrategy } from "./pointsChart";
import { IColorPalette } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces";
import { IColorAssignment, DataViewFacade } from "@gooddata/sdk-ui";
import { ICreateColorAssignmentReturnValue } from "@gooddata/sdk-ui-vis-commons";

export class BubbleChartColorStrategy extends PointsChartColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        let colorAssignment;
        if (stackByAttribute) {
            colorAssignment = super.createColorAssignment(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
            ).fullColorAssignment;
        } else {
            colorAssignment = this.singleMeasureColorMapping(colorPalette, colorMapping, dv);
        }

        return {
            fullColorAssignment: colorAssignment,
        };
    }

    protected createPalette(
        colorPalette: IColorPalette,
        colorAssignment: IColorAssignment[],
        viewByAttribute: any,
        stackByAttribute: any,
    ): string[] {
        if (stackByAttribute) {
            return super.createPalette(colorPalette, colorAssignment, viewByAttribute, stackByAttribute);
        }

        return super.createSingleColorPalette(colorPalette, colorAssignment, stackByAttribute);
    }
}
