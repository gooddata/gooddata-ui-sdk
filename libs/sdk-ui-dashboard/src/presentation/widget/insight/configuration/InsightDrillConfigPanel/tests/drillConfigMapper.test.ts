// (C) 2023 GoodData Corporation
import { describe, it, expect } from "vitest";

import { getGlobalDrillDownMappedConfigForWidget } from "../drillConfigMapper.js";
import { availableDrillTargets, globalDrillDowns } from "./drillConfigMapper.fixture.js";

describe("drillConfigMapper", () => {
    describe("getGlobalDrillDownMappedConfigForWidget", () => {
        it("should map global drill downs to drill down attribute hierarchy configs", () => {
            expect(
                getGlobalDrillDownMappedConfigForWidget(globalDrillDowns, availableDrillTargets),
            ).toMatchSnapshot();
        });
    });
});
