// (C) 2019-2025 GoodData Corporation
import { describe, expect, it, vi } from "vitest";

import { type Matcher, suppressConsole } from "@gooddata/util";

import { newTestAttributeFilterHandler } from "./fixtures.js";
import { waitForAsync } from "./testUtils.js";

describe("AttributeFilterHandler", () => {
    const commonErrorOuptput: Matcher[] = [
        {
            type: "startsWith",
            value: "Error while loading attribute:",
        },
        {
            type: "startsWith",
            value: "Error while initializing:",
        },
    ];

    it("init() should trigger onInitStart() callback", async () => {
        const onInitStart = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.onInitStart(onInitStart);
        attributeFilterHandler.init("start");

        await waitForAsync();

        expect(onInitStart).toHaveBeenCalledTimes(1);
        expect(onInitStart.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("init() that was successful should trigger onInitSuccess() callback", async () => {
        const onInitSuccess = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.onInitSuccess(onInitSuccess);
        attributeFilterHandler.init("success");

        await waitForAsync();

        expect(onInitSuccess).toHaveBeenCalledTimes(1);
        expect(onInitSuccess.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("init() that failed should trigger onInitError() callback", async () => {
        const onInitError = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        attributeFilterHandler.onInitError(onInitError);
        attributeFilterHandler.init("error");

        await suppressConsole(waitForAsync, "error", commonErrorOuptput);

        expect(onInitError).toHaveBeenCalledTimes(1);
        expect(onInitError.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("init() that was canceled should trigger onInitCancel() callback", async () => {
        const onInitCancel = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.onInitCancel(onInitCancel);

        attributeFilterHandler.init("cancel");
        attributeFilterHandler.init();

        await waitForAsync();

        expect(onInitCancel).toHaveBeenCalledTimes(1);
        expect(onInitCancel.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("getInitStatus() should return proper status for successful load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        expect(attributeFilterHandler.getInitStatus()).toMatchSnapshot("before the load");

        attributeFilterHandler.init();

        expect(attributeFilterHandler.getInitStatus()).toMatchSnapshot("during the load");

        await waitForAsync();

        expect(attributeFilterHandler.getInitStatus()).toMatchSnapshot("after the load");
    });

    it("getInitStatus() should return proper status for failed load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        expect(attributeFilterHandler.getInitStatus()).toMatchSnapshot("before the load");

        attributeFilterHandler.init();

        expect(attributeFilterHandler.getInitStatus()).toMatchSnapshot("during the load");

        await suppressConsole(waitForAsync, "error", commonErrorOuptput);

        expect(attributeFilterHandler.getInitStatus()).toMatchSnapshot("after the load");
    });

    it("getInitError() should return error", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        attributeFilterHandler.init();

        await suppressConsole(waitForAsync, "error", commonErrorOuptput);

        expect(attributeFilterHandler.getInitError()).toMatchSnapshot();
    });

    it("getElementsByKey() should return selection elements after successful initialization", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();

        await waitForAsync();

        const selection = attributeFilterHandler.getCommittedSelection();
        const elements = attributeFilterHandler.getElementsByKey(selection.keys);
        expect(elements).toMatchSnapshot();
    });
});
