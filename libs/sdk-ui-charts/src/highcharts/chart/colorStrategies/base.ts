// (C) 2020 GoodData Corporation
import { IColorAssignment } from "@gooddata/sdk-ui";
import { IColor, IColorPalette, IColorPaletteItem, isColorFromPalette } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces";
import { DataViewFacade, IResultAttributeHeader } from "@gooddata/sdk-backend-spi";
import { getColorByGuid, getColorFromMapping, getRgbStringFromRGB } from "../../utils/color";
import uniqBy = require("lodash/uniqBy");

export interface IColorStrategy {
    getColorByIndex(index: number): string;

    getColorAssignment(): IColorAssignment[];

    getFullColorAssignment(): IColorAssignment[];
}

export interface ICreateColorAssignmentReturnValue {
    fullColorAssignment: IColorAssignment[];
    outputColorAssignment?: IColorAssignment[];
}

export abstract class ColorStrategy implements IColorStrategy {
    protected palette: string[];
    protected fullColorAssignment: IColorAssignment[];
    protected outputColorAssignment: IColorAssignment[];

    constructor(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        dv: DataViewFacade,
    ) {
        const { fullColorAssignment, outputColorAssignment } = this.createColorAssignment(
            colorPalette,
            colorMapping,
            viewByAttribute,
            stackByAttribute,
            dv,
        );
        this.fullColorAssignment = fullColorAssignment;
        this.outputColorAssignment = outputColorAssignment ? outputColorAssignment : fullColorAssignment;

        this.palette = this.createPalette(
            colorPalette,
            this.fullColorAssignment,
            viewByAttribute,
            stackByAttribute,
        );
    }

    public getColorByIndex(index: number): string {
        return this.palette[index];
    }

    public getColorAssignment() {
        return this.outputColorAssignment;
    }

    public getFullColorAssignment() {
        return this.fullColorAssignment;
    }

    protected createPalette(
        colorPalette: IColorPalette,
        colorAssignment: IColorAssignment[],
        _viewByAttribute: any,
        _stackByAttribute: any,
    ): string[] {
        return colorAssignment.map((map, index: number) => {
            const color = isColorFromPalette(map.color)
                ? getColorByGuid(colorPalette, map.color.value, index)
                : map.color.value;
            return getRgbStringFromRGB(color);
        });
    }

    protected abstract createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue;
}

//
// These functions are often used when constructing custom strategies
//

export function isValidMappedColor(colorItem: IColor, colorPalette: IColorPalette) {
    if (!colorItem) {
        return false;
    }

    if (colorItem.type === "guid") {
        return isColorItemInPalette(colorItem, colorPalette);
    }

    return true;
}

function isColorItemInPalette(colorItem: IColor, colorPalette: IColorPalette) {
    return colorPalette.some((paletteItem: IColorPaletteItem) => {
        return colorItem.type === "guid" && colorItem.value === paletteItem.guid;
    });
}

export function getAtributeColorAssignment(
    attribute: any,
    colorPalette: IColorPalette,
    colorMapping: IColorMapping[],
    dv: DataViewFacade,
): IColorAssignment[] {
    let currentColorPaletteIndex = 0;
    const uniqItems: IResultAttributeHeader[] = uniqBy<IResultAttributeHeader>(
        attribute.items,
        "attributeHeaderItem.uri",
    );

    return uniqItems.map(headerItem => {
        const mappedColor = getColorFromMapping(headerItem, colorMapping, dv);

        const color: IColor = isValidMappedColor(mappedColor, colorPalette)
            ? mappedColor
            : {
                  type: "guid",
                  value: colorPalette[currentColorPaletteIndex % colorPalette.length].guid,
              };
        currentColorPaletteIndex++;

        return {
            headerItem,
            color,
        };
    });
}
