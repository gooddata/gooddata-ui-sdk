// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAttribute, type IAttributeOrMeasure } from "@gooddata/sdk-model";

import { generateChartOptions } from "../../highcharts/chartTypes/_util/helper.js";
import { type IChartConfig } from "../../interfaces/chartConfig.js";
import { areaChartWithTwoMeasuresAndViewBy } from "../../testUtils/charts.fixtures.js";

import { type IAreaChartProps, getBucketsProps, getConfigProps } from "./AreaChart.js";

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
                stackBy: null as any,
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
    });

    describe("view by two attributes", () => {
        const configWithViewByTwoAttrs = {
            stackMeasures: false,
            stackMeasuresToPercent: false,
        };

        it("should return props with view by 2 attributes and 1 measure", () => {
            const props: IAreaChartProps = {
                workspace: "myProjectId",
                backend: dummyBackend(),
                measures: [ReferenceMd.Amount],
                viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region.Default],
                stackBy: null as any,
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
                stackBy: null as any,
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

describe("area chart stacking", () => {
    it("should keep the default stacking when only `stackMeasuresToPercent` is false", () => {
        const config = getConfigProps({
            measures: [ReferenceMd.Amount, ReferenceMd.Won],
            viewBy: [ReferenceMd.Product.Name],
            config: { stackMeasuresToPercent: false },
        });

        const { stacking } = generateChartOptions(areaChartWithTwoMeasuresAndViewBy, {
            ...config,
            type: "area",
        });

        expect(stacking).toBe("normal");
    });
});
