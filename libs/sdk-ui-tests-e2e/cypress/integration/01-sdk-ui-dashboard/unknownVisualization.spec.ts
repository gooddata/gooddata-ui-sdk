// (C) 2021-2026 GoodData Corporation

import { visit } from "../../tools/navigation";
import { Widget } from "../../tools/widget";

describe("Dashboard with unknown visualization class", { tags: ["pre-merge_isolated_tiger_fe"] }, () => {
    describe("Basic case", () => {
        beforeEach(() => {
            visit("dashboard/dashboard-tiger-unknown-visualization");
        });

        it("should render dashboard even if it contains unknown visualization class", () => {
            new Widget(0).hasError();
        });
    });
});
