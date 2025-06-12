// (C) 2019-2022 GoodData Corporation
import { newTestAttributeFilterHandler } from "./fixtures.js";
import { waitForAsync } from "./testUtils.js";
import * as elements from "../internal/redux/elements/loadElements.js";
import { BadRequestSdkError } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";

describe("AttributeFilterHandler", () => {
    it("loadCustomElements() should trigger onLoadCustomElementsStart() callback", async () => {
        const onLoadCustomElementsStart = vi.fn();
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
        const onLoadCustomElementsSuccess = vi.fn();
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
        const onLoadCustomElementsError = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        vi.spyOn(elements, "loadElements").mockRejectedValueOnce(new BadRequestSdkError("Elements error"));
        attributeFilterHandler.onLoadCustomElementsError(onLoadCustomElementsError);
        attributeFilterHandler.loadCustomElements({}, "error");

        await waitForAsync();

        expect(onLoadCustomElementsError).toHaveBeenCalledTimes(1);
        expect(onLoadCustomElementsError.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadCustomElements() that was canceled by cancelCustomElementsLoad() call should trigger onLoadCustomElementsCancel() callback", async () => {
        const onLoadCustomElementsCancel = vi.fn();
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
        const onLoadCustomElementsStart = vi.fn();
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
        const onLoadCustomElementsSuccess = vi.fn();
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
        const onLoadCustomElementsError = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadCustomElementsError(onLoadCustomElementsError);
        vi.spyOn(elements, "loadElements").mockRejectedValueOnce(new BadRequestSdkError("Elements error"));
        attributeFilterHandler.loadCustomElements({}, "1");
        vi.spyOn(elements, "loadElements").mockRejectedValueOnce(new BadRequestSdkError("Elements error"));
        attributeFilterHandler.loadCustomElements({}, "2");

        await waitForAsync();

        expect(onLoadCustomElementsError).toHaveBeenCalledTimes(2);
    });
});
