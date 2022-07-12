// (C) 2019-2022 GoodData Corporation
import {
    limitingAttributeFilters,
    limitingDateFilters,
    limitingMeasures,
    newTestAttributeFilterHandler,
} from "./fixtures";
import { waitForAsync } from "./testUtils";

describe("MultiSelectAttributeFilterHandler", () => {
    it("should load elements for init selection", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();

        await waitForAsync();

        const selection = attributeFilterHandler.getCommittedSelection();
        const elements = attributeFilterHandler.getItemsByKey(selection.items);
        expect(elements).toMatchSnapshot();
    });

    it("should trigger loadElementsRange success callback", async () => {
        const onElementsRangeLoadStart = jest.fn();
        const onElementsRangeLoadSuccess = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.onElementsRangeLoadStart(onElementsRangeLoadStart);
        attributeFilterHandler.onElementsRangeLoadSuccess(onElementsRangeLoadSuccess);

        attributeFilterHandler.init();
        attributeFilterHandler.loadElementsRange(0, 4, "elementsRangeSuccess");

        await waitForAsync();

        expect(onElementsRangeLoadStart).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadSuccess).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadStart.mock.calls[0]).toMatchSnapshot("onElementsRangeLoadStart parameters");
        expect(onElementsRangeLoadSuccess.mock.calls[0]).toMatchSnapshot(
            "onElementsRangeLoadSuccess parameters",
        );
    });

    it("should trigger loadElementsRange error callback", async () => {
        const onElementsRangeLoadStart = jest.fn();
        const onElementsRangeLoadError = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        attributeFilterHandler.onElementsRangeLoadStart(onElementsRangeLoadStart);
        attributeFilterHandler.onElementsRangeLoadError(onElementsRangeLoadError);

        attributeFilterHandler.init();
        attributeFilterHandler.loadElementsRange(0, 4, "elementsRangeError");

        await waitForAsync();

        expect(onElementsRangeLoadStart).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadError).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadStart.mock.calls[0]).toMatchSnapshot("onElementsRangeLoadStart parameters");
        expect(onElementsRangeLoadError.mock.calls[0]).toMatchSnapshot("onElementsRangeLoadError parameters");
    });

    it("should trigger loadElementsRange cancel callback on cancel", async () => {
        const onElementsRangeLoadStart = jest.fn();
        const onElementsRangeLoadCancel = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.onElementsRangeLoadStart(onElementsRangeLoadStart);
        attributeFilterHandler.onElementsRangeLoadCancel(onElementsRangeLoadCancel);

        attributeFilterHandler.init();
        attributeFilterHandler.loadElementsRange(0, 4, "elementsRangeToBeCanceled");
        attributeFilterHandler.cancelElementLoad();

        await waitForAsync();

        expect(onElementsRangeLoadStart).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadCancel).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadStart.mock.calls[0]).toMatchSnapshot("onElementsRangeLoadStart parameters");
        expect(onElementsRangeLoadCancel.mock.calls[0]).toMatchSnapshot(
            "onElementsRangeLoadCancel parameters",
        );
    });

    it("should trigger loadElementsRange cancel callback on another loadElementsRange call", async () => {
        const onElementsRangeLoadStart = jest.fn();
        const onElementsRangeLoadSuccess = jest.fn();
        const onElementsRangeLoadCancel = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.onElementsRangeLoadStart(onElementsRangeLoadStart);
        attributeFilterHandler.onElementsRangeLoadCancel(onElementsRangeLoadCancel);
        attributeFilterHandler.onElementsRangeLoadSuccess(onElementsRangeLoadSuccess);

        attributeFilterHandler.init();
        attributeFilterHandler.loadElementsRange(0, 4, "elementsRangeToBeCanceled");
        attributeFilterHandler.loadElementsRange(1, 5, "elementsRangeSuccess");

        await waitForAsync();

        expect(onElementsRangeLoadStart).toHaveBeenCalledTimes(2);
        expect(onElementsRangeLoadSuccess).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadCancel).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadStart.mock.calls[0]).toMatchSnapshot("onElementsRangeLoadStart parameters");
        expect(onElementsRangeLoadCancel.mock.calls[0]).toMatchSnapshot(
            "onElementsRangeLoadCancel parameters",
        );
        expect(onElementsRangeLoadSuccess.mock.calls[0]).toMatchSnapshot(
            "onElementsRangeLoadSuccess parameters",
        );
    });

    it("should propagate search option to loadElementsRange", async () => {
        const onElementsRangeLoadStart = jest.fn();
        const onElementsRangeLoadSuccess = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.setSearch("wonder");

        attributeFilterHandler.onElementsRangeLoadStart(onElementsRangeLoadStart);
        attributeFilterHandler.onElementsRangeLoadSuccess(onElementsRangeLoadSuccess);

        attributeFilterHandler.init();
        attributeFilterHandler.loadElementsRange(0, 100, "elementsRangeWithSearch");

        await waitForAsync();

        expect(onElementsRangeLoadStart).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadSuccess).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadStart.mock.calls[0]).toMatchSnapshot("onElementsRangeLoadStart parameters");
        expect(onElementsRangeLoadSuccess.mock.calls[0]).toMatchSnapshot(
            "onElementsRangeLoadSuccess parameters",
        );
    });

    it("should propagate setLimitingAttributeFilters option to loadElementsRange", async () => {
        const onElementsRangeLoadStart = jest.fn();
        const onElementsRangeLoadSuccess = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.setLimitingAttributeFilters(limitingAttributeFilters);

        attributeFilterHandler.onElementsRangeLoadStart(onElementsRangeLoadStart);
        attributeFilterHandler.onElementsRangeLoadSuccess(onElementsRangeLoadSuccess);

        attributeFilterHandler.init();
        attributeFilterHandler.loadElementsRange(0, 100, "elementsRangeWithAttributeFilters");

        await waitForAsync();

        expect(onElementsRangeLoadStart).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadSuccess).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadStart.mock.calls[0]).toMatchSnapshot("onElementsRangeLoadStart parameters");
        expect(onElementsRangeLoadSuccess.mock.calls[0]).toMatchSnapshot(
            "onElementsRangeLoadSuccess parameters",
        );
    });

    it("should propagate setLimitingMeasures option to loadElementsRange", async () => {
        const onElementsRangeLoadStart = jest.fn();
        const onElementsRangeLoadSuccess = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.setLimitingMeasures(limitingMeasures);

        attributeFilterHandler.onElementsRangeLoadStart(onElementsRangeLoadStart);
        attributeFilterHandler.onElementsRangeLoadSuccess(onElementsRangeLoadSuccess);

        attributeFilterHandler.init();
        attributeFilterHandler.loadElementsRange(0, 100, "elementsRangeWithMeasureFilters");

        await waitForAsync();

        expect(onElementsRangeLoadStart).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadSuccess).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadStart.mock.calls[0]).toMatchSnapshot("onElementsRangeLoadStart parameters");
        expect(onElementsRangeLoadSuccess.mock.calls[0]).toMatchSnapshot(
            "onElementsRangeLoadSuccess parameters",
        );
    });

    it("should propagate setLimitingDateFilters option to loadElementsRange", async () => {
        const onElementsRangeLoadStart = jest.fn();
        const onElementsRangeLoadSuccess = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.setLimitingDateFilters(limitingDateFilters);

        attributeFilterHandler.onElementsRangeLoadStart(onElementsRangeLoadStart);
        attributeFilterHandler.onElementsRangeLoadSuccess(onElementsRangeLoadSuccess);

        attributeFilterHandler.init();
        attributeFilterHandler.loadElementsRange(0, 100, "elementsRangeWithDateFilters");

        await waitForAsync();

        expect(onElementsRangeLoadStart).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadSuccess).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadStart.mock.calls[0]).toMatchSnapshot("onElementsRangeLoadStart parameters");
        expect(onElementsRangeLoadSuccess.mock.calls[0]).toMatchSnapshot(
            "onElementsRangeLoadSuccess parameters",
        );
    });

    it("should propagate all options to loadElementsRange", async () => {
        const onElementsRangeLoadStart = jest.fn();
        const onElementsRangeLoadSuccess = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.setLimitingAttributeFilters(limitingAttributeFilters);
        attributeFilterHandler.setLimitingMeasures(limitingMeasures);
        attributeFilterHandler.setLimitingDateFilters(limitingDateFilters);

        attributeFilterHandler.onElementsRangeLoadStart(onElementsRangeLoadStart);
        attributeFilterHandler.onElementsRangeLoadSuccess(onElementsRangeLoadSuccess);

        attributeFilterHandler.init();
        attributeFilterHandler.loadElementsRange(0, 100, "elementsRangeWithMultipleFilters");

        await waitForAsync();

        expect(onElementsRangeLoadStart).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadSuccess).toHaveBeenCalledTimes(1);
        expect(onElementsRangeLoadStart.mock.calls[0]).toMatchSnapshot("onElementsRangeLoadStart parameters");
        expect(onElementsRangeLoadSuccess.mock.calls[0]).toMatchSnapshot(
            "onElementsRangeLoadSuccess parameters",
        );
    });
});
