// (C) 2022-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import {
    negativeAttributeFilterDefaultDF,
    newTestAttributeFilterHandlerWithAttributeFilter,
} from "./AttributeFilterHandler.test.helpers.js";
import { waitForAsync } from "./waitForAsync.test.utils.js";

describe("AttributeFilterHandler", () => {
    it("scroll and search to reset offset", async () => {
        const onLoadNextElementsPageStart = vi.fn();
        const onLoadNextElementsPageSuccess = vi.fn();

        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            negativeAttributeFilterDefaultDF,
        );

        attributeFilterHandler.setLimit(2);
        attributeFilterHandler.init();

        await waitForAsync();

        attributeFilterHandler.onLoadNextElementsPageStart(onLoadNextElementsPageStart);
        attributeFilterHandler.onLoadNextElementsPageSuccess(onLoadNextElementsPageSuccess);

        attributeFilterHandler.loadNextElementsPage("start");

        await waitForAsync();

        expect(attributeFilterHandler.getOffset()).toBe(2);

        attributeFilterHandler.loadInitialElementsPage("start");

        await waitForAsync();

        expect(attributeFilterHandler.getOffset()).toBe(0);
    });
});
