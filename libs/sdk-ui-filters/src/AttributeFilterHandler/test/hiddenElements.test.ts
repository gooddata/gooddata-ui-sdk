// (C) 2019-2022 GoodData Corporation
import { newTestAttributeFilterHandler } from "./fixtures.js";
import { waitForAsync } from "./testUtils.js";
import { describe, it, expect } from "vitest";

describe("AttributeFilterHandler", () => {
    it("hiddenElements option should hide element in getAllElements()", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("hidden");

        attributeFilterHandler.init();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });

    it("hiddenElements option should work properly with loadNextElementsPage() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("hidden");

        attributeFilterHandler.setLimit(1);
        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.loadNextElementsPage();
        await waitForAsync();

        expect(attributeFilterHandler.getAllElements()).toMatchSnapshot();
    });
});
