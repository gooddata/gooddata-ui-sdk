// (C) 2020-2025 GoodData Corporation
import { type IColorPalette } from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";

import {
    ColorStrategy,
    type ICreateColorAssignmentReturnValue,
    getAttributeColorAssignment,
} from "./base.js";
import { type IColorMapping } from "./types.js";

/**
 * @internal
 */
export class AttributeColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        const attribute = stackByAttribute || viewByAttribute;
        const colorAssignment = getAttributeColorAssignment(attribute, colorPalette, colorMapping, dv);
        return {
            fullColorAssignment: colorAssignment,
        };
    }
}
