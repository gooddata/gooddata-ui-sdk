// (C) 2020-2022 GoodData Corporation
import { IColorPalette } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { ColorStrategy, ICreateColorAssignmentReturnValue, getAttributeColorAssignment } from "./base.js";
import { IColorMapping } from "./types.js";

/**
 * @internal
 */
export class AttributeColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        viewByAttribute: any,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        const attribute = stackByAttribute ? stackByAttribute : viewByAttribute;
        const colorAssignment = getAttributeColorAssignment(attribute, colorPalette, colorMapping, dv);
        return {
            fullColorAssignment: colorAssignment,
        };
    }
}
