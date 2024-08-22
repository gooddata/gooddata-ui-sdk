// (C) 2023-2024 GoodData Corporation
import { describe, it, expect } from "vitest";

import { getGlobalDrillDownMappedConfigForWidget } from "../drillConfigMapper.js";
import { availableDrillTargets, globalDrillDowns } from "./drillConfigMapper.fixture.js";
import { idRef, IInsightWidget } from "@gooddata/sdk-model";

describe("drillConfigMapper", () => {
    describe("getGlobalDrillDownMappedConfigForWidget", () => {
        it("should map global drill downs to drill down attribute hierarchy configs", () => {
            expect(
                getGlobalDrillDownMappedConfigForWidget(globalDrillDowns, availableDrillTargets, {
                    ref: idRef("test_widget_id", "insight"),
                } as IInsightWidget),
            ).toMatchSnapshot();
        });
    });
});
