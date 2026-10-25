// (C) 2007-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { type IAppState } from "../../store/types.js";

import { getCustomDimensions } from "./custom_dimensions.js";
import { MockTrackingData, MockTrackingState } from "./tracking_state.test.helpers.js";

describe("getCustomDimensions", () => {
    let state: IAppState;

    beforeEach(() => {
        state = MockTrackingState();
    });

    it("extracts stuff from state", () => {
        const expectedDimensions = {
            dimension2: MockTrackingData.loginMD5,
            dimension3: "gooddata.com",
            dimension4: MockTrackingData.organizationName,
            dimension5: MockTrackingData.projectId,
            dimension8: "(0x0)*0",
            dimension9: MockTrackingData.projectTemplate,
        };

        expect(getCustomDimensions(state)).toEqual(expectedDimensions);
    });
});
