// (C) 2020-2025 GoodData Corporation
import { IColorPalette } from "@gooddata/sdk-model";
import { DataViewFacade, IColorAssignment } from "@gooddata/sdk-ui";
import { ICreateColorAssignmentReturnValue, getAttributeColorAssignment } from "@gooddata/sdk-ui-vis-commons";

import { IColorMapping } from "../../../interfaces/index.js";
import { MeasureColorStrategy } from "../_chartColoring/measure.js";

export class TreemapColorStrategy extends MeasureColorStrategy {
    protected override createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        let colorAssignment: IColorAssignment[];
        if (viewByAttribute) {
            colorAssignment = getAttributeColorAssignment(viewByAttribute, colorPalette, colorMapping, dv);
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
