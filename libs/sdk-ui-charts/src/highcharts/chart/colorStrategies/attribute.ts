// (C) 2020 GoodData Corporation
import { ColorStrategy, getAtributeColorAssignment, ICreateColorAssignmentReturnValue } from "./base";
import { IColorPalette } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces";
import { DataViewFacade } from "@gooddata/sdk-backend-spi";

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
