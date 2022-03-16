// (C) 2022 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newInsightDefinition } from "@gooddata/sdk-model";
import { getReactEmbeddingCodeGenerator } from "..";

describe("getReactEmbeddingCodeGenerator", () => {
    const mockInsight = newInsightDefinition("foo");

    type Scenario = [string, number | string];
    const scenarios: Scenario[] = [
        ["without height", undefined],
        ["with height as number", 1000],
        ["with height as string", "20rem"],
    ];

    it.each(scenarios)("should generate embedding code %s", (_, height) => {
        const generator = getReactEmbeddingCodeGenerator({
            component: {
                importType: "named",
                name: "Foo",
                package: "@gooddata/foo",
            },
            insightToProps() {
                return { prop: "string", another: [ReferenceMd.Account.Name] };
            },
        });
        expect(generator(mockInsight, { height })).toMatchSnapshot();
    });
});
