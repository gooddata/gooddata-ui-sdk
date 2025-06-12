// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";

describe("Dashboard with unknown visualization class", { tags: ["pre-merge_isolated_tiger"] }, () => {
    describe("Basic case", () => {
        beforeEach(() => {
            Navigation.visit("dashboard/dashboard-tiger-unknown-visualization");
        });

        it("should render dashboard even if it contains unknown visualization class", () => {
            new Widget(0).hasError();
        });
    });
});
