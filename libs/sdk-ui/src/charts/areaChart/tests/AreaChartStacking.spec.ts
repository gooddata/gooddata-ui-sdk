// (C) 2007-2018 GoodData Corporation
import { getBucketsProps, getConfigProps, IAreaChartProps } from "../AreaChart";
import { IChartConfig } from "../../../base/interfaces/Config";
import { AttributeOrMeasure, IAttribute, IMeasure } from "@gooddata/sdk-model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

function createAttribute(id: number): IAttribute {
    return {
        attribute: {
            localIdentifier: `a${id}`,
            displayForm: {
                uri: `/gdc/md/myproject/obj/${id}`,
            },
        },
    };
}

function createMeasure(id: number): IMeasure {
    return {
        measure: {
            localIdentifier: `m${id}`,
            definition: {
                measureDefinition: {
                    item: {
                        uri: `/gdc/md/myproject/obj/${id}`,
                    },
                },
            },
        },
    };
}

const [ATTRIBUTE_1, ATTRIBUTE_2, ATTRIBUTE_3]: IAttribute[] = [1, 2, 3].map(createAttribute);

const [MEASURE_1, MEASURE_2]: IMeasure[] = [1, 2].map(createMeasure);

describe("getPropsForArea", () => {
    function getPropsForArea(
        props: IAreaChartProps,
    ): {
        measures: AttributeOrMeasure[];
        viewBy: IAttribute[];
        stackBy: IAttribute[];
        config: IChartConfig;
    } {
        return {
            ...getBucketsProps(props),
            config: getConfigProps(props),
        };
    }

    describe("view by one attribute", () => {
        it("should return props with empty chart props", () => {
            const props: IAreaChartProps = {
                workspace: "myProjectId",
                backend: dummyBackend(),
                measures: [],
                viewBy: [],
                stackBy: null,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [],
                viewBy: [],
                stackBy: [],
                config: {},
            });
        });

        it("should return props with normal chart props", () => {
            const props: IAreaChartProps = {
                backend: dummyBackend(),
                workspace: "myProjectId",
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: ATTRIBUTE_2,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: [ATTRIBUTE_2],
                config: {},
            });
        });

        it("should return props with stacking config", () => {
            const props: IAreaChartProps = {
                workspace: "myProjectId",
                backend: dummyBackend(),
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: ATTRIBUTE_2,
                config: { stacking: false },
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: [ATTRIBUTE_2],
                config: { stacking: false },
            });
        });

        it.each([[true, false], [false, true]])(
            'should return props with "%s" stackMeasures overwrites "%s" stacking config',
            (stackMeasures: boolean, stacking: boolean) => {
                const props: IAreaChartProps = {
                    workspace: "myProjectId",
                    backend: dummyBackend(),
                    measures: [MEASURE_1],
                    viewBy: [ATTRIBUTE_1],
                    stackBy: ATTRIBUTE_2,
                    config: { stacking, stackMeasures },
                };
                expect(getPropsForArea(props)).toEqual({
                    measures: [MEASURE_1],
                    viewBy: [ATTRIBUTE_1],
                    stackBy: [ATTRIBUTE_2],
                    config: {
                        stacking: stackMeasures,
                        stackMeasures,
                    },
                });
            },
        );

        it.each([[true, false], [false, true]])(
            'should return props with "%s" stackMeasuresToPercent overwrites "%s" stacking config',
            (stackMeasuresToPercent: boolean, stacking: boolean) => {
                const props: IAreaChartProps = {
                    workspace: "myProjectId",
                    backend: dummyBackend(),
                    measures: [MEASURE_1],
                    viewBy: [ATTRIBUTE_1],
                    stackBy: ATTRIBUTE_2,
                    config: { stacking, stackMeasuresToPercent },
                };
                const result = getPropsForArea(props);
                expect(result).toEqual({
                    measures: [MEASURE_1],
                    viewBy: [ATTRIBUTE_1],
                    stackBy: [ATTRIBUTE_2],
                    config: {
                        stacking: stackMeasuresToPercent,
                        stackMeasuresToPercent,
                    },
                });
            },
        );
    });

    describe("view by two attributes", () => {
        const configWithViewByTwoAttrs = {
            stacking: false,
            stackMeasures: false,
            stackMeasuresToPercent: false,
        };

        it("should return props with view by 2 attributes and 1 measure", () => {
            const props: IAreaChartProps = {
                workspace: "myProjectId",
                backend: dummyBackend(),
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1, ATTRIBUTE_2],
                stackBy: null,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: [ATTRIBUTE_2],
                config: configWithViewByTwoAttrs,
            });
        });

        it("should return props with view by 2 attributes and 2 measure", () => {
            const props: IAreaChartProps = {
                workspace: "myProjectId",
                backend: dummyBackend(),
                measures: [MEASURE_1, MEASURE_2],
                viewBy: [ATTRIBUTE_1, ATTRIBUTE_2],
                stackBy: null,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: [ATTRIBUTE_2],
                config: configWithViewByTwoAttrs,
            });
        });

        it("should return props with view by 2 attributes and 1 measure and one stack by", () => {
            const props: IAreaChartProps = {
                workspace: "myProjectId",
                backend: dummyBackend(),
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1, ATTRIBUTE_2],
                stackBy: ATTRIBUTE_3,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [MEASURE_1],
                viewBy: [ATTRIBUTE_1],
                stackBy: [ATTRIBUTE_2],
                config: configWithViewByTwoAttrs,
            });
        });
    });
});
