// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IAttribute, IAttributeOrMeasure } from "@gooddata/sdk-model";

import { IChartConfig } from "../../../interfaces/index.js";
import { IAreaChartProps, getBucketsProps, getConfigProps } from "../AreaChart.js";

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
                measures: [ReferenceMd.Amount],
                viewBy: [ReferenceMd.Product.Name],
                stackBy: ReferenceMd.Region.Default,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [ReferenceMd.Amount],
                viewBy: [ReferenceMd.Product.Name],
                stackBy: [ReferenceMd.Region.Default],
                config: {},
            });
        });

        it("should return props with stacking config", () => {
            const props: IAreaChartProps = {
                workspace: "myProjectId",
                backend: dummyBackend(),
                measures: [ReferenceMd.Amount],
                viewBy: [ReferenceMd.Product.Name],
                stackBy: ReferenceMd.Region.Default,
                config: { stacking: false },
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [ReferenceMd.Amount],
                viewBy: [ReferenceMd.Product.Name],
                stackBy: [ReferenceMd.Region.Default],
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
                    measures: [ReferenceMd.Amount],
                    viewBy: [ReferenceMd.Product.Name],
                    stackBy: ReferenceMd.Region.Default,
                    config: { stacking, stackMeasures },
                };
                expect(getPropsForArea(props)).toEqual({
                    measures: [ReferenceMd.Amount],
                    viewBy: [ReferenceMd.Product.Name],
                    stackBy: [ReferenceMd.Region.Default],
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
                    measures: [ReferenceMd.Amount],
                    viewBy: [ReferenceMd.Product.Name],
                    stackBy: ReferenceMd.Region.Default,
                    config: { stacking, stackMeasuresToPercent },
                };
                const result = getPropsForArea(props);
                expect(result).toEqual({
                    measures: [ReferenceMd.Amount],
                    viewBy: [ReferenceMd.Product.Name],
                    stackBy: [ReferenceMd.Region.Default],
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
                measures: [ReferenceMd.Amount],
                viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region.Default],
                stackBy: null,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [ReferenceMd.Amount],
                viewBy: [ReferenceMd.Product.Name],
                stackBy: [ReferenceMd.Region.Default],
                config: configWithViewByTwoAttrs,
            });
        });

        it("should return props with view by 2 attributes and 2 measure", () => {
            const props: IAreaChartProps = {
                workspace: "myProjectId",
                backend: dummyBackend(),
                measures: [ReferenceMd.Amount, ReferenceMd.Amount],
                viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region.Default],
                stackBy: null,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [ReferenceMd.Amount],
                viewBy: [ReferenceMd.Product.Name],
                stackBy: [ReferenceMd.Region.Default],
                config: configWithViewByTwoAttrs,
            });
        });

        it("should return props with view by 2 attributes and 1 measure and one stack by", () => {
            const props: IAreaChartProps = {
                workspace: "myProjectId",
                backend: dummyBackend(),
                measures: [ReferenceMd.Amount],
                viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region.Default],
                stackBy: ReferenceMd.Region.Default,
            };
            expect(getPropsForArea(props)).toEqual({
                measures: [ReferenceMd.Amount],
                viewBy: [ReferenceMd.Product.Name],
                stackBy: [ReferenceMd.Region.Default],
                config: configWithViewByTwoAttrs,
            });
        });
    });
});
