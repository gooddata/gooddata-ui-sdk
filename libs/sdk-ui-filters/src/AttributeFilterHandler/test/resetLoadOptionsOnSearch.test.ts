// (C) 2022-2025 GoodData Corporation
import { describe, expect, it, vi } from "vitest";

import {
    negativeAttributeFilterDefaultDF,
    newTestAttributeFilterHandlerWithAttributeFilter,
} from "./fixtures.js";
import { waitForAsync } from "./testUtils.js";

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
