// (C) 2007-2018 GoodData Corporation
import { getBucketsProps, getConfigProps } from '../areaChart';
import { VisualizationObject } from '@gooddata/typings';
import { IAreaChartProps } from '../../../components/AreaChart';
import { IChartConfig } from '../../..';
import { getViewByTwoAttributes, getSanitizedStackingConfig } from '../common';
import BucketItem = VisualizationObject.BucketItem;
import IVisualizationAttribute = VisualizationObject.IVisualizationAttribute;

function createAttribute(id: number): VisualizationObject.IVisualizationAttribute {
    return {
        visualizationAttribute: {
            localIdentifier: `a${id}`,
            displayForm: {
                uri: `/gdc/md/myproject/obj/${id}`
            }
        }
    };
}

function createMeasure(id: number): VisualizationObject.IMeasure {
    return {
        measure: {
            localIdentifier: `m${id}`,
            definition: {
                measureDefinition: {
                    item: {
                        uri: `/gdc/md/myproject/obj/${id}`
                    }
                }
            }
        }
    };
}

const [
    ATTRIBUTE_1,
    ATTRIBUTE_2,
    ATTRIBUTE_3
]: VisualizationObject.IVisualizationAttribute[] = [1, 2, 3].map(createAttribute);

const [
    MEASURE_1,
    MEASURE_2
]: VisualizationObject.IMeasure[] = [1, 2].map(createMeasure);

describe('getViewByTwoAttributes', () => {
    it.each`
        description | viewBy | expectation
        ${'should return no attribute when viewBy is undefined'} | ${undefined} | ${[]}
        ${'should return no attribute when viewBy is empty'} | ${[]} | ${[]}
        ${'should return one attribute when viewBy is one-element array'} | ${[ATTRIBUTE_1]} | ${[ATTRIBUTE_1]}
        ${'should return one attribute when viewBy is single object'} | ${ATTRIBUTE_1} | ${[ATTRIBUTE_1]}
        ${'should return two attributes'} | ${[ATTRIBUTE_1, ATTRIBUTE_2]} | ${[ATTRIBUTE_1, ATTRIBUTE_2]}
        ${'should return first two attributes'} | ${[ATTRIBUTE_1, ATTRIBUTE_2, ATTRIBUTE_3]} |
                                                  ${[ATTRIBUTE_1, ATTRIBUTE_2]}
    `('$description', ({
        viewBy,
        expectation
    }: {
        viewBy: VisualizationObject.IVisualizationAttribute | VisualizationObject.IVisualizationAttribute[],
        expectation: VisualizationObject.IVisualizationAttribute | VisualizationObject.IVisualizationAttribute[]
    }) => {
        const result = getViewByTwoAttributes(viewBy);
        expect(result).toEqual(expectation);
    });
});

describe('getSanitizedStackingConfig', () => {
    it('should return undefined when config is not input', () => {
        const config = getSanitizedStackingConfig({
            projectId: 'testProject',
            measures: [MEASURE_1]
        });
        expect(config).toBeFalsy();
    });

    it('should ignore stacking setting with one measure', () => {
        const props = {
            projectId: 'testProject',
            measures: [MEASURE_1],
            config: {
                stackMeasures: true,
                stackMeasuresToPercent: true
            }
        };
        const config = getSanitizedStackingConfig(props);
        expect(config).toEqual({
            stackMeasures: false,
            stackMeasuresToPercent: false
        });
    });

    it('should not ignore stacking setting with one measure and one stackBy', () => {
        const props = {
            projectId: 'testProject',
            measures: [MEASURE_1],
            stackBy: ATTRIBUTE_1,
            config: {
                stackMeasuresToPercent: true
            }
        };
        const config = getSanitizedStackingConfig(props);
        expect(config).toEqual({
            stackMeasuresToPercent: true
        });
    });
});

describe('getPropsForArea', () => {

    function getPropsForArea(props: IAreaChartProps): {
        measures: BucketItem[],
        viewBy: IVisualizationAttribute[],
        stackBy: IVisualizationAttribute[],
        config: IChartConfig
    } {
        return {
            ...getBucketsProps(props),
            config: getConfigProps(props)
        };
    }

    describe('view by one attribute', () => {

        it('should return props with empty chart props', () => {
            const props: IAreaChartProps = {
                projectId: 'myProjectId',
                measures: [],
                viewBy: [],
                stackBy: null
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [],
                viewBy: [],
                stackBy: [],
                config: {}
            });
        });

        it('should return props with normal chart props', () => {
            const props: IAreaChartProps = {
                projectId: 'myProjectId',
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: ATTRIBUTE_2
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: [ATTRIBUTE_2],
                config: {}
            });
        });

        it('should return props with stacking config', () => {
            const props: IAreaChartProps = {
                projectId: 'myProjectId',
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: ATTRIBUTE_2,
                config: { stacking: false }
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: [ATTRIBUTE_2],
                config: { stacking: false }
            });
        });

        it.each([
            [true, false],
            [false, true]
        ])('should return props with "%s" stackMeasures overwrites "%s" stacking config', (
            stackMeasures: boolean,
            stacking: boolean
        ) => {
            const props: IAreaChartProps = {
                projectId: 'myProjectId',
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: ATTRIBUTE_2,
                config: { stacking, stackMeasures }
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: [ATTRIBUTE_2],
                config: {
                    stacking: stackMeasures,
                    stackMeasures
                }
            });
        });

        it.each([
            [true, false],
            [false, true]
        ])('should return props with "%s" stackMeasuresToPercent overwrites "%s" stacking config', (
            stackMeasuresToPercent: boolean,
            stacking: boolean
        ) => {
            const props: IAreaChartProps = {
                projectId: 'myProjectId',
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: ATTRIBUTE_2,
                config: { stacking, stackMeasuresToPercent }
            };
            const result = getPropsForArea(props);
            expect(result).toEqual({
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: [ATTRIBUTE_2],
                config: {
                    stacking: stackMeasuresToPercent,
                    stackMeasuresToPercent
                }
            });
        });
    });

    describe('view by two attributes', () => {
        const configWithViewByTwoAttrs = {
            stacking: false,
            stackMeasures: false,
            stackMeasuresToPercent: false
        };

        it('should return props with view by 2 attributes and 1 measure', () => {
            const props: IAreaChartProps = {
                projectId: 'myProjectId',
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1, ATTRIBUTE_2],
                stackBy: null
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: [ATTRIBUTE_2],
                config: configWithViewByTwoAttrs
            });
        });

        it('should return props with view by 2 attributes and 2 measure', () => {
            const props: IAreaChartProps = {
                projectId: 'myProjectId',
                measures: [MEASURE_1, MEASURE_2],
                viewBy: [ATTRIBUTE_1, ATTRIBUTE_2],
                stackBy: null
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: [ATTRIBUTE_2],
                config: configWithViewByTwoAttrs
            });
        });

        it('should return props with view by 2 attributes and 1 measure and one stack by', () => {
            const props: IAreaChartProps = {
                projectId: 'myProjectId',
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1, ATTRIBUTE_2],
                stackBy: ATTRIBUTE_3
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: [ATTRIBUTE_2],
                config: configWithViewByTwoAttrs
            });
        });
    });
});
