// (C) 2019-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import {
    hiddenElements,
    newTestAttributeFilterHandlerWithAttributeFilter,
    positiveAttributeFilterDefaultDF,
} from "./fixtures.js";
import { waitForAsync } from "./testUtils.js";

describe("AttributeFilterHandler", () => {
    it("hiddenElements option should hide element in getAllElements()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
            { hiddenElements },
        );

        attributeFilterHandler.init();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("hiddenElements option should work properly with loadNextElementsPage() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandlerWithAttributeFilter(
            positiveAttributeFilterDefaultDF,
            { hiddenElements },
        );

        attributeFilterHandler.setLimit(1);
        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.loadNextElementsPage();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });
});
