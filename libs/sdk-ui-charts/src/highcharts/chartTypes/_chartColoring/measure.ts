// (C) 2020-2022 GoodData Corporation

import {
    ColorStrategy,
    ICreateColorAssignmentReturnValue,
    isValidMappedColor,
    getColorByGuid,
    getColorFromMapping,
    getLighterColorFromRGB,
} from "@gooddata/sdk-ui-vis-commons";
import {
    IColor,
    IColorFromPalette,
    IColorPalette,
    isColorFromPalette,
    RgbType,
    IMeasureDescriptor,
} from "@gooddata/sdk-model";
import { isDarkTheme } from "@gooddata/sdk-ui-theme-provider";
import { IColorMapping } from "../../../interfaces/index.js";
import { IColorAssignment, DataViewFacade } from "@gooddata/sdk-ui";
import { findMeasureGroupInDimensions } from "../_util/executionResultHelper.js";

const emptyColorPaletteItem: IColorFromPalette = { type: "guid", value: "none" };

export class MeasureColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        _viewByAttribute: any,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        _stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        const { allMeasuresAssignment, nonDerivedMeasuresAssignment } = this.mapColorsFromMeasures(
            dv,
            colorMapping,
            colorPalette,
        );

        return {
            fullColorAssignment: this.mapColorsFromDerivedMeasure(dv, allMeasuresAssignment, colorPalette),
            outputColorAssignment: nonDerivedMeasuresAssignment,
        };
    }

    private mapColorsFromMeasures(
        dv: DataViewFacade,
        colorMapping: IColorMapping[],
        colorPalette: IColorPalette,
    ): { allMeasuresAssignment: IColorAssignment[]; nonDerivedMeasuresAssignment: IColorAssignment[] } {
        let currentColorPaletteIndex = 0;

        const nonDerivedMeasuresAssignment: IColorAssignment[] = [];
        const measureGroup = findMeasureGroupInDimensions(dv.meta().dimensions());
        const allMeasuresAssignment = measureGroup.items.map((headerItem, index) => {
            if (dv.meta().isDerivedMeasure(measureGroup.items[index])) {
                return {
                    headerItem,
                    color: emptyColorPaletteItem,
                };
            }

            const mappedMeasure: IColorAssignment = this.mapMeasureColor(
                headerItem,
                currentColorPaletteIndex,
                colorPalette,
                colorMapping,
                dv,
            );

            currentColorPaletteIndex++;
            nonDerivedMeasuresAssignment.push(mappedMeasure);

            return mappedMeasure;
        });

        return {
            allMeasuresAssignment,
            nonDerivedMeasuresAssignment,
        };
    }

    private mapMeasureColor(
        descriptor: IMeasureDescriptor,
        currentColorPaletteIndex: number,
        colorPalette: IColorPalette,
        colorAssignment: IColorMapping[],
        dv: DataViewFacade,
    ): IColorAssignment {
        const mappedColor = getColorFromMapping(descriptor, colorAssignment, dv);

        const color: IColor = isValidMappedColor(mappedColor, colorPalette)
            ? mappedColor
            : {
                  type: "guid",
                  value: colorPalette[currentColorPaletteIndex % colorPalette.length].guid,
              };

        return {
            headerItem: descriptor,
            color,
        };
    }

    private mapColorsFromDerivedMeasure(
        dv: DataViewFacade,
        measuresColorAssignment: IColorAssignment[],
        colorPalette: IColorPalette,
    ): IColorAssignment[] {
        return measuresColorAssignment.map((mapItem, measureItemIndex) => {
            const measureGroup = findMeasureGroupInDimensions(dv.meta().dimensions());

            if (!dv.meta().isDerivedMeasure(measureGroup.items[measureItemIndex])) {
                return mapItem;
            }

            const masterMeasure = dv
                .def()
                .masterMeasureForDerived(
                    measureGroup.items[measureItemIndex].measureHeaderItem.localIdentifier,
                );
            if (!masterMeasure) {
                return mapItem;
            }
            const parentMeasureIndex = dv.def().measureIndex(masterMeasure.measure.localIdentifier);
            if (parentMeasureIndex > -1) {
                const sourceMeasureColor = measuresColorAssignment[parentMeasureIndex].color;
                return this.getDerivedMeasureColorAssignment(
                    sourceMeasureColor,
                    colorPalette,
                    measureItemIndex,
                    mapItem,
                );
            }
            return {
                ...mapItem,
                color: mapItem.color,
            };
        });
    }

    private getDerivedMeasureColorAssignment(
        sourceMeasureColor: IColor,
        colorPalette: IColorPalette,
        measureItemIndex: number,
        mapItem: IColorAssignment,
    ) {
        const rgbColor = isColorFromPalette(sourceMeasureColor)
            ? getColorByGuid(colorPalette, sourceMeasureColor.value, measureItemIndex)
            : sourceMeasureColor.value;
        return {
            ...mapItem,
            color: {
                type: "rgb" as RgbType,
                value: getLighterColorFromRGB(rgbColor, isDarkTheme(this.theme) ? -0.6 : 0.6),
            },
        };
    }
}
