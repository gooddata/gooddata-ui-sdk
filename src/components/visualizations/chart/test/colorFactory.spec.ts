// (C) 2007-2018 GoodData Corporation
import {
    TreeMapColorStrategy,
    MeasureColorStrategy,
    AttributeColorStrategy,
    HeatMapColorStrategy,
    ColorFactory,
    IColorStrategy
} from '../colorFactory';

import { getMVS } from './helper';

import {
    DEFAULT_COLOR_PALETTE,
    HEATMAP_BLUE_COLOR_PALETTE,
    getRgbString
} from '../../utils/color';

import * as fixtures from '../../../../../stories/test_data/fixtures';
import { IColorPalette, IColorPaletteItem } from '../Chart';

function getColorsFromStrategy(strategy: IColorStrategy): string[] {
    const res: string[] = [];
    let color: string;
    let index = 0;

    do {
        color = strategy.getColorByIndex(index);
        if (color !== undefined) {
            res.push(color);
        }
        index++;
    }
    while (color !== undefined);

    return res;
}

describe('ColorFactory', () => {
    const customPalette = [
        {
            guid: '01',
            fill: {
                r: 50,
                g: 50,
                b: 50
            }
        },
        {
            guid: '02',
            fill: {
                r: 100,
                g: 100,
                b: 100
            }
        },
        {
            guid: '03',
            fill: {
                r: 150,
                g: 150,
                b: 150
            }
        },
        {
            guid: '04',
            fill: {
                r: 200,
                g: 200,
                b: 200
            }
        }
    ];

    it('should return AttributeColorStrategy with two colors from default color palette', () => {
        const [measureGroup, viewByAttribute, stackByAttribute] =
            getMVS(fixtures.barChartWithStackByAndViewByAttributes);
        const { afm } = fixtures.barChartWithStackByAndViewByAttributes.executionRequest;
        const type = 'bar';
        const colorPalette: IColorPalette = undefined;

        const colorStrategy = ColorFactory.getColorStrategy(
            colorPalette,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            afm,
            type
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);

        expect(colorStrategy).toBeInstanceOf(AttributeColorStrategy);
        expect(updatedPalette).toEqual(
            DEFAULT_COLOR_PALETTE
                .slice(0, 2)
                .map((defaultColorPaletteItem: IColorPaletteItem) => getRgbString(defaultColorPaletteItem))
            );
    });

    it('should return AttributeColorStrategy with two colors from custom color palette', () => {
        const [measureGroup, viewByAttribute, stackByAttribute] =
            getMVS(fixtures.barChartWithStackByAndViewByAttributes);
        const { afm } = fixtures.barChartWithStackByAndViewByAttributes.executionRequest;
        const type = 'bar';
        const colorPalette = [{
            guid: 'red',
            fill: {
                r: 255,
                g: 0,
                b: 0
            }
        }, {
            guid: 'green',
            fill: {
                r: 0,
                g: 255,
                b: 0
            }
        }, {
            guid: 'blue',
            fill: {
                r: 0,
                g: 0,
                b: 255
            }
        }];

        const colorStrategy = ColorFactory.getColorStrategy(
            colorPalette,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            afm,
            type
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);

        expect(colorStrategy).toBeInstanceOf(AttributeColorStrategy);
        expect(updatedPalette).toEqual(
            colorPalette
                .slice(0, 2)
                .map((defaultColorPaletteItem: IColorPaletteItem) => getRgbString(defaultColorPaletteItem))
        );
    });

    it('should return TreeMapColorStrategy strategy with two colors from default color palette', () => {
        const [measureGroup, viewByAttribute, stackByAttribute] =
            getMVS(fixtures.treemapWithMetricViewByAndStackByAttribute);
        const { afm } = fixtures.treemapWithMetricViewByAndStackByAttribute.executionRequest;
        const type = 'treemap';
        const colorPalette: IColorPalette = undefined;

        const colorStrategy = ColorFactory.getColorStrategy(
            colorPalette,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            afm,
            type
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);

        expect(colorStrategy).toBeInstanceOf(TreeMapColorStrategy);
        expect(updatedPalette).toEqual(
            DEFAULT_COLOR_PALETTE
                .slice(0, 1)
                .map((defaultColorPaletteItem: IColorPaletteItem) => getRgbString(defaultColorPaletteItem))
        );
    });

    it('should return HeatMapColorStrategy strategy with two colors from default color palette', () => {
        const [measureGroup, viewByAttribute, stackByAttribute] =
            getMVS(fixtures.heatmapMetricRowColumn);
        const { afm } = fixtures.heatmapMetricRowColumn.executionRequest;
        const type = 'heatmap';
        const colorPalette: IColorPalette = undefined;

        const colorStrategy = ColorFactory.getColorStrategy(
            colorPalette,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            afm,
            type
        );

        expect(colorStrategy).toBeInstanceOf(HeatMapColorStrategy);
        [0, 1, 2, 3, 4, 5, 6].map((colorIndex: number) =>
            expect(colorStrategy.getColorByIndex(colorIndex)).toEqual(HEATMAP_BLUE_COLOR_PALETTE[colorIndex])
        );
    });

    it('should just return the original palette if there are no pop measures shorten to cover all legend items',
        () => {
            const [measureGroup, viewByAttribute, stackByAttribute] = getMVS(fixtures.barChartWithoutAttributes);
            const { afm } = fixtures.barChartWithoutAttributes.executionRequest;
            const type = 'column';
            const colorPalette: IColorPalette = undefined;

            const colorStrategy = ColorFactory.getColorStrategy(
                colorPalette,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm,
                type
            );

            const itemsCount = measureGroup.items.length;
            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(itemsCount).toEqual(updatedPalette.length);
        });

    it('should return a palette with a lighter color for each pop measure based on it`s source measure', () => {
        const [measureGroup, viewByAttribute, stackByAttribute] =
            getMVS(fixtures.barChartWithPopMeasureAndViewByAttribute);
        const { afm } = fixtures.barChartWithPopMeasureAndViewByAttribute.executionRequest;
        const type = 'column';

        const colorStrategy = ColorFactory.getColorStrategy(
            customPalette,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            afm,
            type
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);
        expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
        expect(updatedPalette).toEqual(['rgb(173,173,173)', 'rgb(50,50,50)']);
    });

    it('should return a palette with a lighter color for each previous period based on it`s source measure', () => {
        const [measureGroup, viewByAttribute, stackByAttribute] =
            getMVS(fixtures.barChartWithPreviousPeriodMeasure);
        const { afm } = fixtures.barChartWithPreviousPeriodMeasure.executionRequest;
        const type = 'column';

        const colorStrategy = ColorFactory.getColorStrategy(
            customPalette,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            afm,
            type
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);
        expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
        expect(updatedPalette).toEqual(['rgb(173,173,173)', 'rgb(50,50,50)']);
    });

    it('should rotate colors from original palette and generate lighter PoP colors', () => {
        const [measureGroup, viewByAttribute, stackByAttribute] =
            getMVS(fixtures.barChartWith6PopMeasuresAndViewByAttribute);
        const { afm } = fixtures.barChartWith6PopMeasuresAndViewByAttribute.executionRequest;
        const type = 'column';

        const colorStrategy = ColorFactory.getColorStrategy(
            customPalette,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            afm,
            type
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);

        expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
        expect(updatedPalette).toEqual(['rgb(173,173,173)', 'rgb(50,50,50)', 'rgb(193,193,193)',
            'rgb(100,100,100)', 'rgb(213,213,213)', 'rgb(150,150,150)', 'rgb(233,233,233)', 'rgb(200,200,200)',
            'rgb(173,173,173)', 'rgb(50,50,50)', 'rgb(193,193,193)', 'rgb(100,100,100)']);
    });

    it('should rotate colors from original palette and generate lighter previous period measures', () => {
        const [measureGroup, viewByAttribute, stackByAttribute] =
            getMVS(fixtures.barChartWith6PreviousPeriodMeasures);
        const { afm } = fixtures.barChartWith6PreviousPeriodMeasures.executionRequest;
        const type = 'column';

        const colorStrategy = ColorFactory.getColorStrategy(
            customPalette,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            afm,
            type
        );

        const updatedPalette = getColorsFromStrategy(colorStrategy);

        expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);

        expect(updatedPalette).toEqual(['rgb(173,173,173)', 'rgb(50,50,50)', 'rgb(193,193,193)',
            'rgb(100,100,100)', 'rgb(213,213,213)', 'rgb(150,150,150)', 'rgb(233,233,233)', 'rgb(200,200,200)',
            'rgb(173,173,173)', 'rgb(50,50,50)', 'rgb(193,193,193)', 'rgb(100,100,100)']);
    });
});
