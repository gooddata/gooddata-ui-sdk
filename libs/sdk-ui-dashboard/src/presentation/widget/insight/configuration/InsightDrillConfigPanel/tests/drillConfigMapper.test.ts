// (C) 2023-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { getGlobalDrillDownMappedConfigForWidget } from "../drillConfigMapper.js";

import { availableDrillTargets, globalDrillDowns } from "./drillConfigMapper.fixture.js";

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
