// (C) 2024 GoodData Corporation

import { it, describe, expect } from "vitest";
import { changeFilterContextSelection } from "../filterViews";
import { FilterContextItem } from "@gooddata/sdk-model";
import { filterContext } from "./filterViews.mock";

describe("filterViews", () => {
    describe("changeFilterContextSelection", () => {
        it("should set selection of matching filters in provided filters context and leave the rest of its filters as is", () => {
            const filters: FilterContextItem[] = [
                {
                    dateFilter: {
                        granularity: "GDC.time.year",
                        type: "relative",
                        from: -1,
                        to: -1,
                    },
                },
                {
                    attributeFilter: {
                        attributeElements: { uris: ["Advertising"] },
                        displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                        negativeSelection: true,
                        localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                        // the filter setting no longer matches the one in the filter context, therefore will not be applied
                        selectionMode: "multi",
                    },
                },
                {
                    attributeFilter: {
                        attributeElements: { uris: ["Midwest"] },
                        displayForm: { identifier: "region", type: "displayForm" },
                        negativeSelection: false,
                        localIdentifier: "a01fc28d9a8244b99179d3f7320b3400",
                        selectionMode: "multi",
                    },
                },
                {
                    dateFilter: {
                        dataSet: { identifier: "date", type: "dataSet" },
                        type: "relative",
                        granularity: "GDC.time.year",
                        from: -1,
                        to: -1,
                    },
                },
                {
                    attributeFilter: {
                        attributeElements: { uris: ["C"] },
                        displayForm: { identifier: "negative-filter", type: "displayForm" },
                        negativeSelection: false,
                        localIdentifier: "b01fc28d9a8244b99179d3f7320b3400",
                        selectionMode: "multi",
                    },
                },
            ];
            expect(changeFilterContextSelection(filterContext, filters)).toMatchSnapshot();
        });
    });
});
