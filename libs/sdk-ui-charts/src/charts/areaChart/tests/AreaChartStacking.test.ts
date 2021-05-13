// (C) 2007-2020 GoodData Corporation
import { getBucketsProps, getConfigProps, IAreaChartProps } from "../AreaChart";
import { IChartConfig } from "../../../interfaces";
import { IAttributeOrMeasure, IAttribute } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

describe("getPropsForArea", () => {
    function getPropsForArea(props: IAreaChartProps): {
        measures: IAttributeOrMeasure[];
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
                measures: [ReferenceLdm.Amount],
                viewBy: [ReferenceLdm.Product.Name],
                stackBy: ReferenceLdm.Region,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [ReferenceLdm.Amount],
                viewBy: [ReferenceLdm.Product.Name],
                stackBy: [ReferenceLdm.Region],
                config: {},
            });
        });

        it("should return props with stacking config", () => {
            const props: IAreaChartProps = {
                workspace: "myProjectId",
                backend: dummyBackend(),
                measures: [ReferenceLdm.Amount],
                viewBy: [ReferenceLdm.Product.Name],
                stackBy: ReferenceLdm.Region,
                config: { stacking: false },
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [ReferenceLdm.Amount],
                viewBy: [ReferenceLdm.Product.Name],
                stackBy: [ReferenceLdm.Region],
                config: { stacking: false },
            });
        });

        it.each([
            [true, false],
            [false, true],
        ])(
            'should return props with "%s" stackMeasures overwrites "%s" stacking config',
            (stackMeasures: boolean, stacking: boolean) => {
                const props: IAreaChartProps = {
                    workspace: "myProjectId",
                    backend: dummyBackend(),
                    measures: [ReferenceLdm.Amount],
                    viewBy: [ReferenceLdm.Product.Name],
                    stackBy: ReferenceLdm.Region,
                    config: { stacking, stackMeasures },
                };
                expect(getPropsForArea(props)).toEqual({
                    measures: [ReferenceLdm.Amount],
                    viewBy: [ReferenceLdm.Product.Name],
                    stackBy: [ReferenceLdm.Region],
                    config: {
                        stacking: stackMeasures,
                        stackMeasures,
                    },
                });
            },
        );

        it.each([
            [true, false],
            [false, true],
        ])(
            'should return props with "%s" stackMeasuresToPercent overwrites "%s" stacking config',
            (stackMeasuresToPercent: boolean, stacking: boolean) => {
                const props: IAreaChartProps = {
                    workspace: "myProjectId",
                    backend: dummyBackend(),
                    measures: [ReferenceLdm.Amount],
                    viewBy: [ReferenceLdm.Product.Name],
                    stackBy: ReferenceLdm.Region,
                    config: { stacking, stackMeasuresToPercent },
                };
                const result = getPropsForArea(props);
                expect(result).toEqual({
                    measures: [ReferenceLdm.Amount],
                    viewBy: [ReferenceLdm.Product.Name],
                    stackBy: [ReferenceLdm.Region],
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
                measures: [ReferenceLdm.Amount],
                viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
                stackBy: null,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [ReferenceLdm.Amount],
                viewBy: [ReferenceLdm.Product.Name],
                stackBy: [ReferenceLdm.Region],
                config: configWithViewByTwoAttrs,
            });
        });

        it("should return props with view by 2 attributes and 2 measure", () => {
            const props: IAreaChartProps = {
                workspace: "myProjectId",
                backend: dummyBackend(),
                measures: [ReferenceLdm.Amount, ReferenceLdm.Amount],
                viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
                stackBy: null,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [ReferenceLdm.Amount],
                viewBy: [ReferenceLdm.Product.Name],
                stackBy: [ReferenceLdm.Region],
                config: configWithViewByTwoAttrs,
            });
        });

        it("should return props with view by 2 attributes and 1 measure and one stack by", () => {
            const props: IAreaChartProps = {
                workspace: "myProjectId",
                backend: dummyBackend(),
                measures: [ReferenceLdm.Amount],
                viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
                stackBy: ReferenceLdm.Region,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [ReferenceLdm.Amount],
                viewBy: [ReferenceLdm.Product.Name],
                stackBy: [ReferenceLdm.Region],
                config: configWithViewByTwoAttrs,
            });
        });
    });
});
