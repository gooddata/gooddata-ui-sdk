// (C) 2007-2018 GoodData Corporation
import {
    TreemapColorStrategy,
    MeasureColorStrategy,
    AttributeColorStrategy,
    HeatmapColorStrategy,
    BubbleChartColorStrategy,
    ScatterPlotColorStrategy,
    ColorFactory,
    IColorStrategy
} from '../colorFactory';

import { getMVS } from './helper';

import {
    DEFAULT_COLOR_PALETTE,
    HEATMAP_BLUE_COLOR_PALETTE,
    getRgbString
} from '../../utils/color';
import { CUSTOM_COLOR_PALETTE } from '../../../../../stories/data/colors';

import * as fixtures from '../../../../../stories/test_data/fixtures';
import {
    IColorPalette,
    IColorPaletteItem,
    RGBType,
    IColorMapping
} from '../../../../interfaces/Config';
import { Execution } from '@gooddata/typings';
import range = require('lodash/range');

function getColorsFromStrategy(strategy: IColorStrategy): string[] {
    const res: string[] = [];

    for (let i = 0; i < strategy.getFullColorAssignment().length; i++) {
        res.push(strategy.getColorByIndex(i));
    }

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

    describe('AttributeColorStrategy', () => {
        it('should return AttributeColorStrategy with two colors from default color palette', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.barChartWithStackByAndViewByAttributes);
            const { afm } = fixtures.barChartWithStackByAndViewByAttributes.executionRequest;
            const type = 'bar';
            const colorPalette: IColorPalette = undefined;

            const colorStrategy = ColorFactory.getColorStrategy(
                colorPalette,
                undefined,
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
                undefined,
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

        it('should return AttributeColorStrategy with properly applied mapping', () => {
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
            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: Execution.IResultAttributeHeaderItem) =>
                        headerItem.attributeHeaderItem && (headerItem.attributeHeaderItem.uri
                            === '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1024/elements?id=1225'),
                    color: {
                        type: 'guid',
                        value: 'blue'
                    }
                }, {
                    predicate: (headerItem: Execution.IResultAttributeHeaderItem) =>
                        headerItem.attributeHeaderItem && (headerItem.attributeHeaderItem.uri
                            === 'invalid'),
                    color: {
                        type: 'rgb' as RGBType,
                        value: {
                            r: 0,
                            g: 0,
                            b: 0
                        }
                    }
                }, {
                    predicate: (headerItem: Execution.IResultAttributeHeaderItem) =>
                        headerItem.attributeHeaderItem && (headerItem.attributeHeaderItem.uri
                            === '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1024/elements?id=1237'),
                    color: {
                        type: 'rgb' as RGBType,
                        value: {
                            r: 0,
                            g: 0,
                            b: 1
                        }
                    }
                }
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                colorPalette,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm,
                type
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(AttributeColorStrategy);
            expect(updatedPalette).toEqual(
                [ 'rgb(0,0,255)', 'rgb(0,0,1)']
            );
        });
    });

    describe('MeasureColorStrategy', () => {
        it('should return a palette with a lighter color for each pop measure based on it`s source measure', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.barChartWithPopMeasureAndViewByAttribute);
            const { afm } = fixtures.barChartWithPopMeasureAndViewByAttribute.executionRequest;
            const type = 'column';

            const colorStrategy = ColorFactory.getColorStrategy(
                customPalette,
                undefined,
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
                undefined,
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
                undefined,
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
                undefined,
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

        it('should just return the original palette if there are no pop measures shorten to cover all legend items',
            () => {
                const [measureGroup, viewByAttribute, stackByAttribute] = getMVS(fixtures.barChartWithoutAttributes);
                const { afm } = fixtures.barChartWithoutAttributes.executionRequest;
                const type = 'column';
                const colorPalette: IColorPalette = undefined;

                const colorStrategy = ColorFactory.getColorStrategy(
                    colorPalette,
                    undefined,
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

        it('should return MeasureColorStrategy with properly applied mapping', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.barChartWith6PopMeasuresAndViewByAttribute);
            const { afm } = fixtures.barChartWith6PopMeasuresAndViewByAttribute.executionRequest;
            const type = 'column';
            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: Execution.IMeasureHeaderItem) =>
                        headerItem.measureHeaderItem.localIdentifier === 'amountMeasure_0',
                    color: {
                        type: 'guid',
                        value: '02'
                    }
                }, {
                    predicate: (headerItem: Execution.IMeasureHeaderItem) =>
                        headerItem.measureHeaderItem.localIdentifier === 'amountPopMeasure_0',
                    color: {
                        type: 'guid',
                        value: '03'
                    }
                }, {
                    predicate: (headerItem: Execution.IMeasureHeaderItem) =>
                        headerItem.measureHeaderItem.localIdentifier === 'amountMeasure_1',
                    color: {
                        type: 'guid',
                        value: '03'
                    }
                }
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                customPalette,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm,
                type
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
            expect(updatedPalette).toEqual([ 'rgb(193,193,193)', 'rgb(100,100,100)', 'rgb(213,213,213)',
                'rgb(150,150,150)', 'rgb(213,213,213)', 'rgb(150,150,150)', 'rgb(233,233,233)', 'rgb(200,200,200)',
                'rgb(173,173,173)', 'rgb(50,50,50)', 'rgb(193,193,193)', 'rgb(100,100,100)'
            ]);
        });

        it('should return only non-derived measures in getColorAssignment', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.barChartWith6PopMeasuresAndViewByAttribute);
            const { afm } = fixtures.barChartWith6PopMeasuresAndViewByAttribute.executionRequest;
            const type = 'column';

            const colorStrategy = ColorFactory.getColorStrategy(
                customPalette,
                undefined,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm,
                type
            );

            expect(colorStrategy.getColorAssignment().length).toEqual(6);
        });
    });

    describe('TreemapColorStrategy', () => {
        it('should return TreemapColorStrategy strategy with two colors from default color palette', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.treemapWithMetricViewByAndStackByAttribute);
            const { afm } = fixtures.treemapWithMetricViewByAndStackByAttribute.executionRequest;
            const type = 'treemap';
            const colorPalette: IColorPalette = undefined;

            const colorStrategy = ColorFactory.getColorStrategy(
                colorPalette,
                undefined,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm,
                type
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(TreemapColorStrategy);
            expect(updatedPalette).toEqual(
                DEFAULT_COLOR_PALETTE
                    .slice(0, 1)
                    .map((defaultColorPaletteItem: IColorPaletteItem) => getRgbString(defaultColorPaletteItem))
            );
        });

        it('should return TreemapColorStrategy with properly applied mapping', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.treemapWithMetricViewByAndStackByAttribute);
            const { afm } = fixtures.treemapWithMetricViewByAndStackByAttribute.executionRequest;
            const type = 'treemap';

            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: Execution.IMeasureHeaderItem) =>
                        headerItem.measureHeaderItem.localIdentifier === 'amountMetric',
                    color: {
                        type: 'guid',
                        value: '02'
                    }
                }
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                customPalette,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm,
                type
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(TreemapColorStrategy);
            expect(updatedPalette).toEqual(
                ['rgb(100,100,100)']
            );
        });
    });

    describe('HeatmapColorStrategy', () => {
        it('should return HeatmapColorStrategy strategy with 7 colors from default heatmap color palette', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.heatmapMetricRowColumn);
            const { afm } = fixtures.heatmapMetricRowColumn.executionRequest;
            const type = 'heatmap';

            const colorStrategy = ColorFactory.getColorStrategy(
                undefined,
                undefined,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm,
                type
            );

            expect(colorStrategy).toBeInstanceOf(HeatmapColorStrategy);
            [0, 1, 2, 3, 4, 5, 6].map((colorIndex: number) =>
                expect(colorStrategy.getColorByIndex(colorIndex)).toEqual(HEATMAP_BLUE_COLOR_PALETTE[colorIndex])
            );
        });

        it('should return HeatmapColorStrategy strategy with 7 colors'
            + ' based on the first color from custom palette', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.heatmapMetricRowColumn);
            const { afm } = fixtures.heatmapMetricRowColumn.executionRequest;
            const type = 'heatmap';

            const expectedColors = [
                'rgb(255,255,255)',
                'rgb(245,220,224)',
                'rgb(235,186,194)',
                'rgb(225,152,164)',
                'rgb(215,117,133)',
                'rgb(205,83,103)',
                'rgb(195,49,73)'
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                CUSTOM_COLOR_PALETTE,
                undefined,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm,
                type
            );

            expect(colorStrategy).toBeInstanceOf(HeatmapColorStrategy);
            [0, 1, 2, 3, 4, 5, 6].map((colorIndex: number) =>
                expect(colorStrategy.getColorByIndex(colorIndex)).toEqual(expectedColors[colorIndex])
            );
        });

        it('should return HeatmapColorStrategy with properly applied mapping', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.heatmapMetricRowColumn);
            const { afm } = fixtures.heatmapMetricRowColumn.executionRequest;
            const type = 'heatmap';

            const expectedColors = [
                'rgb(255,255,255)',
                'rgb(240,244,226)',
                'rgb(226,234,198)',
                'rgb(211,224,170)',
                'rgb(197,214,142)',
                'rgb(182,204,114)',
                'rgb(168,194,86)'
            ];
            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: Execution.IMeasureHeaderItem) =>
                        headerItem.measureHeaderItem.localIdentifier === 'amountMeasure',
                    color: {
                        type: 'guid',
                        value: '02'
                    }
                }
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                CUSTOM_COLOR_PALETTE,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm,
                type
            );

            expect(colorStrategy).toBeInstanceOf(HeatmapColorStrategy);
            [0, 1, 2, 3, 4, 5, 6].map((colorIndex: number) =>
                expect(colorStrategy.getColorByIndex(colorIndex)).toEqual(expectedColors[colorIndex])
            );
        });
    });

    describe('BubbleChartStrategy', () => {
        it('shouls create palette with color from first measure', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.bubbleChartWith3Metrics);
            const { afm } = fixtures.bubbleChartWith3Metrics.executionRequest;
            const type = 'bubble';

            const expectedColors = ['rgb(0,0,0)'];
            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: Execution.IMeasureHeaderItem) =>
                        headerItem.measureHeaderItem.localIdentifier === '784a5018a51049078e8f7e86247e08a3',
                    color: {
                        type: 'rgb',
                        value: {
                            r: 0,
                            g: 0,
                            b: 0
                        }
                    }
                }
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                CUSTOM_COLOR_PALETTE,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm,
                type
            );

            expect(colorStrategy).toBeInstanceOf(BubbleChartColorStrategy);
            expect(colorStrategy.getColorAssignment().length).toEqual(1);
            expect(colorStrategy.getColorByIndex(0)).toEqual(expectedColors[0]);
        });

        it('should create palette with color for each attribute element', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.bubbleChartWith3MetricsAndAttribute);
            const { afm } = fixtures.bubbleChartWith3MetricsAndAttribute.executionRequest;
            const type = 'bubble';

            const expectedColors = ['rgb(0,0,0)'];
            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: Execution.IResultAttributeHeaderItem) =>
                        headerItem.attributeHeaderItem.uri
                            === '/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/1025/elements?id=1224',
                    color: {
                        type: 'rgb',
                        value: {
                            r: 0,
                            g: 0,
                            b: 0
                        }
                    }
                }
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                CUSTOM_COLOR_PALETTE,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm,
                type
            );

            expect(colorStrategy).toBeInstanceOf(BubbleChartColorStrategy);
            expect(colorStrategy.getColorAssignment().length).toEqual(20);
            expect(colorStrategy.getColorByIndex(0)).toEqual(expectedColors[0]);
        });
    });

    describe('ScatterPlotColorStrategy', () => {
        it('should create palette with same color from first measure for all attribute elements', () => {
            const [measureGroup, viewByAttribute, stackByAttribute] =
                getMVS(fixtures.scatterPlotWith2MetricsAndAttribute);
            const { afm } = fixtures.scatterPlotWith2MetricsAndAttribute.executionRequest;
            const type = 'scatter';

            const expectedColor = 'rgb(0,0,0)';
            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: Execution.IMeasureHeaderItem) =>
                        headerItem.measureHeaderItem.localIdentifier
                            === '33bd337ed5534fd383861f11ff657b23',
                    color: {
                        type: 'rgb',
                        value: {
                            r: 0,
                            g: 0,
                            b: 0
                        }
                    }
                }
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                CUSTOM_COLOR_PALETTE,
                colorMapping,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                afm,
                type
            );

            expect(colorStrategy).toBeInstanceOf(ScatterPlotColorStrategy);
            expect(colorStrategy.getColorAssignment().length).toEqual(1);
            range(6).map((itemIndex) => {
                expect(colorStrategy.getColorByIndex(itemIndex)).toEqual(expectedColor);
            });
        });
    });
});
