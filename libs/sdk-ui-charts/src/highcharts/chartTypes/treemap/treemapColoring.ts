// (C) 2020-2026 GoodData Corporation

import { type IColorPalette } from "@gooddata/sdk-model";
import { type DataViewFacade, type IColorAssignment } from "@gooddata/sdk-ui";
import {
    type IColorMapping,
    type ICreateColorAssignmentReturnValue,
    getAttributeColorAssignment,
} from "@gooddata/sdk-ui-vis-commons";

import { MeasureColorStrategy } from "../_chartColoring/measure.js";

export class TreemapColorStrategy extends MeasureColorStrategy {
    protected override createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[] | undefined,
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
            colorAssignment = result.outputColorAssignment!;
        }

        return {
            fullColorAssignment: colorAssignment,
            outputColorAssignment: colorAssignment,
        };
    }
}
