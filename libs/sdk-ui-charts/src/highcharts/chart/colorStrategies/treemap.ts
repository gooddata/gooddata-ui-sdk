// (C) 2020 GoodData Corporation
import { MeasureColorStrategy } from "./measure";
import { IColorPalette } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces";
import { IColorAssignment, DataViewFacade } from "@gooddata/sdk-ui";
import { getAtributeColorAssignment, ICreateColorAssignmentReturnValue } from "@gooddata/sdk-ui-vis-commons";

export class TreemapColorStrategy extends MeasureColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        let colorAssignment: IColorAssignment[];
        if (viewByAttribute) {
            colorAssignment = getAtributeColorAssignment(viewByAttribute, colorPalette, colorMapping, dv);
        } else {
            const result = super.createColorAssignment(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
            );
            colorAssignment = result.outputColorAssignment;
        }

        return {
            fullColorAssignment: colorAssignment,
            outputColorAssignment: colorAssignment,
        };
    }
}
