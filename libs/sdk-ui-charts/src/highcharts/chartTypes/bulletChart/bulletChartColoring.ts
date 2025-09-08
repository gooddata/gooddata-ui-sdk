// (C) 2020-2025 GoodData Corporation
import {
    IColor,
    IColorPalette,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    Identifier,
    isColorFromPalette,
    isRgbColor,
} from "@gooddata/sdk-model";
import { DataViewFacade, IColorAssignment } from "@gooddata/sdk-ui";
import { isDarkTheme } from "@gooddata/sdk-ui-theme-provider";
import {
    ColorStrategy,
    ICreateColorAssignmentReturnValue,
    getColorByGuid,
    getColorFromMapping,
    getLighterColorFromRGB,
    getRgbStringFromRGB,
    isValidMappedColor,
    normalizeColorToRGB,
    parseRGBString,
} from "@gooddata/sdk-ui-vis-commons";

import {
    getOccupiedMeasureBucketsLocalIdentifiers,
    isComparativeSeries,
    isPrimarySeries,
    isTargetSeries,
} from "./bulletChartSeries.js";
import { IColorMapping } from "../../../interfaces/index.js";
import { DEFAULT_BULLET_GRAY_COLOR } from "../_util/color.js";
import { findMeasureGroupInDimensions } from "../_util/executionResultHelper.js";

class BulletChartColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        _viewByAttribute: any,
        _stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        const occupiedMeasureBucketsLocalIdentifiers = getOccupiedMeasureBucketsLocalIdentifiers(dv);
        const measureGroup = findMeasureGroupInDimensions(dv.meta().dimensions());

        const defaultColorsAssignment = this.getDefaultColorAssignment(
            colorPalette,
            measureGroup,
            occupiedMeasureBucketsLocalIdentifiers,
        );

        const colorAssignment = measureGroup.items.map((headerItem) => {
            const color: IColor = this.mapMeasureColor(
                headerItem,
                colorPalette,
                colorMapping,
                dv,
                defaultColorsAssignment,
            );

            return {
                headerItem,
                color,
            };
        });

        return {
            fullColorAssignment: colorAssignment,
        };
    }

    protected override createPalette(
        colorPalette: IColorPalette,
        colorAssignments: IColorAssignment[],
    ): string[] {
        return colorAssignments
            .map((colorAssignment, index) => {
                if (isRgbColor(colorAssignment.color)) {
                    return colorAssignment.color.value;
                } else if (isColorFromPalette(colorAssignment.color)) {
                    return getColorByGuid(colorPalette, colorAssignment.color.value as string, index);
                }
                return undefined;
            })
            .filter(Boolean)
            .map((color) => getRgbStringFromRGB(color));
    }

    protected mapMeasureColor(
        headerItem: IMeasureDescriptor,
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        dv: DataViewFacade,
        defaultColorsAssignment: IColorAssignment[],
    ): IColor {
        const mappedColor = getColorFromMapping(headerItem, colorMapping, dv);
        if (isValidMappedColor(mappedColor, colorPalette)) {
            return mappedColor;
        }

        const defaultColorAssignment = defaultColorsAssignment.find(
            (colorAssignment: IColorAssignment) =>
                (colorAssignment.headerItem as IMeasureDescriptor).measureHeaderItem.localIdentifier ===
                headerItem.measureHeaderItem.localIdentifier,
        );

        return defaultColorAssignment.color;
    }

    private getDefaultColorAssignment(
        colorPalette: IColorPalette,
        measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
        occupiedMeasureBucketsLocalIdentifiers: Identifier[],
    ): IColorAssignment[] {
        return measureGroup.items.map((headerItem: IMeasureDescriptor, index: number): IColorAssignment => {
            const color: IColor =
                (isPrimarySeries(index, occupiedMeasureBucketsLocalIdentifiers) && {
                    type: "guid",
                    value: colorPalette[0].guid,
                }) ||
                (isTargetSeries(index, occupiedMeasureBucketsLocalIdentifiers) && {
                    type: "rgb",
                    value: getLighterColorFromRGB(colorPalette[0].fill, isDarkTheme(this.theme) ? 0.5 : -0.3),
                }) ||
                (isComparativeSeries(index, occupiedMeasureBucketsLocalIdentifiers) && {
                    type: "rgb",
                    value: this.theme?.palette?.complementary
                        ? parseRGBString(normalizeColorToRGB(this.theme?.palette?.complementary?.c2))
                        : DEFAULT_BULLET_GRAY_COLOR,
                });

            return {
                headerItem,
                color,
            };
        });
    }
}

export default BulletChartColorStrategy;
