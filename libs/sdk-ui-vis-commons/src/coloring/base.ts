// (C) 2020-2022 GoodData Corporation
import { IColorAssignment, DataViewFacade } from "@gooddata/sdk-ui";
import {
    IColor,
    IColorPalette,
    IColorPaletteItem,
    isColorFromPalette,
    ITheme,
    IResultAttributeHeader,
} from "@gooddata/sdk-model";
import { getColorByGuid, getColorFromMapping, getRgbStringFromRGB } from "./color.js";
import uniqBy from "lodash/uniqBy.js";
import { IColorMapping } from "./types.js";

/**
 * @internal
 */
export interface IColorStrategy {
    getColorByIndex(index: number): string;

    getColorAssignment(): IColorAssignment[];

    getFullColorAssignment(): IColorAssignment[];
}

/**
 * @internal
 */
export interface ICreateColorAssignmentReturnValue {
    fullColorAssignment: IColorAssignment[];
    outputColorAssignment?: IColorAssignment[];
}

/**
 * @internal
 */
export abstract class ColorStrategy implements IColorStrategy {
    protected palette: string[];
    protected fullColorAssignment: IColorAssignment[];
    protected outputColorAssignment: IColorAssignment[];
    protected theme?: ITheme;

    constructor(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        viewByAttribute: any,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        stackByAttribute: any,
        dv: DataViewFacade,
        theme?: ITheme,
    ) {
        this.theme = theme;

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

    public getColorAssignment(): IColorAssignment[] {
        return this.outputColorAssignment;
    }

    public getFullColorAssignment(): IColorAssignment[] {
        return this.fullColorAssignment;
    }

    protected createPalette(
        colorPalette: IColorPalette,
        colorAssignment: IColorAssignment[],
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        _viewByAttribute: any,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        viewByAttribute: any,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue;
}

//
// These functions are often used when constructing custom strategies
//

/**
 * @internal
 */
export function isValidMappedColor(colorItem: IColor, colorPalette: IColorPalette): boolean {
    if (!colorItem) {
        return false;
    }

    if (colorItem.type === "guid") {
        return isColorItemInPalette(colorItem, colorPalette);
    }

    return true;
}

/**
 * @internal
 */
function isColorItemInPalette(colorItem: IColor, colorPalette: IColorPalette) {
    return colorPalette.some((paletteItem: IColorPaletteItem) => {
        return colorItem.type === "guid" && colorItem.value === paletteItem.guid;
    });
}

/**
 * @internal
 */
export function getAttributeColorAssignment(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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

    return uniqItems.map((headerItem) => {
        const mappedColor = getColorFromMapping(headerItem, colorMapping, dv);

        const color: IColor =
            mappedColor && isValidMappedColor(mappedColor, colorPalette)
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
