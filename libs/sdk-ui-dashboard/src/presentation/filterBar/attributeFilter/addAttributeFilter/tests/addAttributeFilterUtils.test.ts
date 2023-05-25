// (C) 2023 GoodData Corporation

import { IInsight } from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";
import { isLocationIconEnabled } from "../addAttributeFilterUtils";

describe("add attribute filter utils", () => {
    describe("isLocationIconEnabled", () => {
        const mockInsight: IInsight = {
            insight: {
                buckets: [],
                filters: [],
                sorts: [],
                properties: {},
                visualizationUrl: "local:sankey",
                title: "Insight Template",
                summary: "",
                identifier: "87627fc0-72c3-4e5b-9762-0846ec4a8f58",
                uri: "dummy-url",
                ref: {
                    identifier: "87627fc0-72c3-4e5b-9762-0846ec4a8f58",
                    type: "insight",
                },
                isLocked: false,
            },
        };

        const createMockInsight = (visType: VisType) => ({
            ...mockInsight,
            insight: {
                ...mockInsight.insight,
                visualizationUrl: `local:${visType}`,
            },
        });

        it("should returns true if any insight widget has a supported location icon chart type", () => {
            expect(
                isLocationIconEnabled([
                    createMockInsight("sankey"),
                    createMockInsight("dependencywheel"),
                    createMockInsight("pushpin"),
                ]),
            ).toBe(true);
            expect(isLocationIconEnabled([createMockInsight("sankey"), createMockInsight("pushpin")])).toBe(
                true,
            );
            expect(isLocationIconEnabled([createMockInsight("pushpin")])).toBe(true);
        });

        it("should returns false if no insight widget has a supported location icon chart type", () => {
            expect(
                isLocationIconEnabled([
                    createMockInsight("dependencywheel"),
                    createMockInsight("sankey"),
                    createMockInsight("column"),
                ]),
            ).toBe(false);
        });
    });
});
