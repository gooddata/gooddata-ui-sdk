// (C) 2019-2022 GoodData Corporation
import { newTestAttributeFilterHandler } from "./fixtures";
import { waitForAsync } from "./testUtils";
import * as elements from "../internal/redux/elements/loadElements";
import { BadRequestSdkError } from "@gooddata/sdk-ui";

describe("AttributeFilterHandler", () => {
    it("loadCustomElements() should trigger onLoadCustomElementsStart() callback", async () => {
        const onLoadCustomElementsStart = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadCustomElementsStart(onLoadCustomElementsStart);
        attributeFilterHandler.loadCustomElements({}, "start");

        await waitForAsync();

        expect(onLoadCustomElementsStart).toHaveBeenCalledTimes(1);
        expect(onLoadCustomElementsStart.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadCustomElements() that was successful should trigger onLoadCustomElementsSuccess() callback", async () => {
        const onLoadCustomElementsSuccess = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadCustomElementsSuccess(onLoadCustomElementsSuccess);
        attributeFilterHandler.loadCustomElements({}, "success");

        await waitForAsync();

        expect(onLoadCustomElementsSuccess).toHaveBeenCalledTimes(1);
        expect(onLoadCustomElementsSuccess.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadCustomElements() that failed should trigger onLoadCustomElementsError() callback", async () => {
        const onLoadCustomElementsError = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        jest.spyOn(elements, "loadElements").mockRejectedValueOnce(new BadRequestSdkError("Elements error"));
        attributeFilterHandler.onLoadCustomElementsError(onLoadCustomElementsError);
        attributeFilterHandler.loadCustomElements({}, "error");

        await waitForAsync();

        expect(onLoadCustomElementsError).toHaveBeenCalledTimes(1);
        expect(onLoadCustomElementsError.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadCustomElements() that was canceled by cancelCustomElementsLoad() call should trigger onLoadCustomElementsCancel() callback", async () => {
        const onLoadCustomElementsCancel = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadCustomElementsCancel(onLoadCustomElementsCancel);
        attributeFilterHandler.loadCustomElements({}, "cancel");
        attributeFilterHandler.cancelCustomElementsLoad("cancel");
        await waitForAsync();

        expect(onLoadCustomElementsCancel).toHaveBeenCalledTimes(1);
        expect(onLoadCustomElementsCancel.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadCustomElements() that was called multiple times should trigger onLoadCustomElementsStart() callback multiple times", async () => {
        const onLoadCustomElementsStart = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadCustomElementsStart(onLoadCustomElementsStart);
        attributeFilterHandler.loadCustomElements({}, "1");
        attributeFilterHandler.loadCustomElements({}, "2");

        await waitForAsync();

        expect(onLoadCustomElementsStart).toHaveBeenCalledTimes(2);
    });

    it("loadCustomElements() that was called multiple times should trigger onLoadCustomElementsSuccess() callback multiple times", async () => {
        const onLoadCustomElementsSuccess = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadCustomElementsSuccess(onLoadCustomElementsSuccess);
        attributeFilterHandler.loadCustomElements({}, "1");
        attributeFilterHandler.loadCustomElements({}, "2");

        await waitForAsync();

        expect(onLoadCustomElementsSuccess).toHaveBeenCalledTimes(2);
    });

    it("loadCustomElements() that was called multiple times should trigger onLoadCustomElementsError() callback multiple times", async () => {
        const onLoadCustomElementsError = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadCustomElementsError(onLoadCustomElementsError);
        jest.spyOn(elements, "loadElements").mockRejectedValueOnce(new BadRequestSdkError("Elements error"));
        attributeFilterHandler.loadCustomElements({}, "1");
        jest.spyOn(elements, "loadElements").mockRejectedValueOnce(new BadRequestSdkError("Elements error"));
        attributeFilterHandler.loadCustomElements({}, "2");

        await waitForAsync();

        expect(onLoadCustomElementsError).toHaveBeenCalledTimes(2);
    });
});
