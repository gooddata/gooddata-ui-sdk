// (C) 2020 GoodData Corporation
import { IColorPalette } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { ColorStrategy, ICreateColorAssignmentReturnValue, getAtributeColorAssignment } from "./base";
import { IColorMapping } from "./types";

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
        const attribute = stackByAttribute ? stackByAttribute : viewByAttribute;
        const colorAssignment = getAtributeColorAssignment(attribute, colorPalette, colorMapping, dv);
        return {
            fullColorAssignment: colorAssignment,
        };
    }
}
