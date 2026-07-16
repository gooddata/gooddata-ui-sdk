// (C) 2020-2026 GoodData Corporation

import {
    type IColor,
    type IColorFromPalette,
    type IColorPalette,
    type IMeasureDescriptor,
    type IRgbColorValue,
    type RgbType,
    isColorFromPalette,
} from "@gooddata/sdk-model";
import { type DataViewFacade, type IColorAssignment } from "@gooddata/sdk-ui";
import { isDarkTheme } from "@gooddata/sdk-ui-theme-provider";
import {
    ColorStrategy,
    type IColorMapping,
    type ICreateColorAssignmentReturnValue,
    getColorByGuid,
    getColorFromMapping,
    getContrastRatio,
    getLighterColorFromRGB,
    getRgbStringFromRGB,
    isValidMappedColor,
} from "@gooddata/sdk-ui-vis-commons";

import { findMeasureGroupInDimensions } from "../_util/executionResultHelper.js";

const emptyColorPaletteItem: IColorFromPalette = { type: "guid", value: "none" };

const DERIVED_COLOR_BLEND = 0.6;
const DERIVED_COLOR_BLEND_STEP = 0.4;
// WCAG 1.4.11 Non-text Contrast (Level AA)
const MIN_NON_TEXT_CONTRAST = 3;

export class MeasureColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[] | undefined,
        _viewByAttribute: any,
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
        colorMapping: IColorMapping[] | undefined,
        colorPalette: IColorPalette,
    ): { allMeasuresAssignment: IColorAssignment[]; nonDerivedMeasuresAssignment: IColorAssignment[] } {
        let currentColorPaletteIndex = 0;

        const nonDerivedMeasuresAssignment: IColorAssignment[] = [];
        const measureGroup = findMeasureGroupInDimensions(dv.meta().dimensions());
        const allMeasuresAssignment =
            measureGroup?.items.map((headerItem, index) => {
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
            }) ?? [];

        return {
            allMeasuresAssignment,
            nonDerivedMeasuresAssignment,
        };
    }

    private mapMeasureColor(
        descriptor: IMeasureDescriptor,
        currentColorPaletteIndex: number,
        colorPalette: IColorPalette,
        colorAssignment: IColorMapping[] | undefined,
        dv: DataViewFacade,
    ): IColorAssignment {
        const mappedColor = getColorFromMapping(descriptor, colorAssignment, dv);

        const color: IColor | undefined = isValidMappedColor(mappedColor, colorPalette)
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
                    sourceMeasureColor!,
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
        const direction = isDarkTheme(this.theme) ? -1 : 1;
        return {
            ...mapItem,
            color: {
                type: "rgb" as RgbType,
                value: this.enableContrastSafeDerivedColors
                    ? this.getContrastSafeDerivedColor(rgbColor)
                    : getLighterColorFromRGB(rgbColor, direction * DERIVED_COLOR_BLEND),
            },
        };
    }

    private getContrastSafeDerivedColor(sourceColor: IRgbColorValue): IRgbColorValue {
        // the reference theme keeps the workspace-declared background even in applications
        // that strip it from the presentation theme, so all applications derive the same color
        const referenceTheme = this.referenceTheme ?? this.theme;
        const direction = isDarkTheme(referenceTheme) ? -1 : 1;
        const backgroundColor =
            referenceTheme?.chart?.backgroundColor || referenceTheme?.palette?.complementary?.c0 || "#fff";

        // the standard blend first, so compliant charts keep their standard look
        const preferred = getLighterColorFromRGB(sourceColor, direction * DERIVED_COLOR_BLEND);
        if (getContrastRatio(getRgbStringFromRGB(preferred), backgroundColor) >= MIN_NON_TEXT_CONTRAST) {
            return preferred;
        }

        // then step-multiples below the standard blend, strongest first; blends weaker
        // than one step would be indistinguishable from the master measure color
        const stepsBelowStandard = Math.ceil(DERIVED_COLOR_BLEND / DERIVED_COLOR_BLEND_STEP) - 1;
        for (let step = stepsBelowStandard; step >= 1; step--) {
            const candidate = getLighterColorFromRGB(
                sourceColor,
                direction * step * DERIVED_COLOR_BLEND_STEP,
            );
            if (getContrastRatio(getRgbStringFromRGB(candidate), backgroundColor) >= MIN_NON_TEXT_CONTRAST) {
                return candidate;
            }
        }

        // the source color is too close to the background, derive in the opposite direction
        const maxSteps = Math.floor(1 / DERIVED_COLOR_BLEND_STEP);
        for (let step = 1; step <= maxSteps; step++) {
            const candidate = getLighterColorFromRGB(
                sourceColor,
                -direction * step * DERIVED_COLOR_BLEND_STEP,
            );
            if (getContrastRatio(getRgbStringFromRGB(candidate), backgroundColor) >= MIN_NON_TEXT_CONTRAST) {
                return candidate;
            }
        }

        return preferred;
    }
}
