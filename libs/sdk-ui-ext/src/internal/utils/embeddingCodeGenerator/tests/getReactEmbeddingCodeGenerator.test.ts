// (C) 2022 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newInsightDefinition } from "@gooddata/sdk-model";
import { getReactEmbeddingCodeGenerator } from "..";

describe("getReactEmbeddingCodeGenerator", () => {
    const mockInsight = newInsightDefinition("foo");

    const generator = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "Foo",
            package: "@gooddata/foo",
        },
        insightToProps() {
            return {
                prop: {
                    value: "string",
                    meta: {
                        typeImport: { name: "Type", package: "some-package", importType: "default" },
                        cardinality: "scalar",
                    },
                },
                another: {
                    value: [ReferenceMd.Account.Name],
                    meta: {
                        typeImport: { name: "Type2", package: "some-package2", importType: "named" },
                        cardinality: "array",
                    },
                },
            };
        },
    });

    describe("height test", () => {
        type Scenario = [string, number | string];
        const scenarios: Scenario[] = [
            ["without height", undefined],
            ["with height as number", 1000],
            ["with height as string", "20rem"],
        ];

        it.each(scenarios)("should generate embedding code %s", (_, height) => {
            expect(generator(mockInsight, { height })).toMatchSnapshot();
        });
    });

    describe("omitChartProps", () => {
        type Scenario = [string, string[]];
        const scenarios: Scenario[] = [
            ["no props to omit defined in empty array", []],
            ["no props to omit defined as undefined", undefined],
            ["omit one prop", ["prop"]],
            ["omit all props", ["prop", "another"]],
        ];

        it.each(scenarios)("should generate embedding code %s", (_, omitProps) => {
            expect(generator(mockInsight, { omitChartProps: omitProps })).toMatchSnapshot();
        });
    });
});
