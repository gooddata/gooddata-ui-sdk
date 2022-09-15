// (C) 2022 GoodData Corporation
import { newTestAttributeFilterHandler } from "./fixtures";
import { waitForAsync } from "./testUtils";

describe("AttributeFilterHandler", () => {
    it("scroll and search to reset offset", async () => {
        const onLoadNextElementsPageStart = jest.fn();
        const onLoadNextElementsPageSuccess = jest.fn();

        const attributeFilterHandler = newTestAttributeFilterHandler("negative");

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
