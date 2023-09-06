// (C) 2019-2022 GoodData Corporation
import { newTestAttributeFilterHandler } from "./fixtures.js";
import { waitForAsync } from "./testUtils.js";
import { describe, it, expect, vi } from "vitest";

describe("AttributeFilterHandler", () => {
    it("initTotalCount() should trigger onInitStart() callback", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init("start");

        await waitForAsync();

        expect(attributeFilterHandler.getTotalElementsCount()).toBeUndefined();

        attributeFilterHandler.initTotalCount("start");

        await waitForAsync();

        expect(attributeFilterHandler.getTotalElementsCount()).toBe(7);
    });

    it("initTotalCount() should set status", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init("start");

        await waitForAsync();

        attributeFilterHandler.initTotalCount("start");

        await waitForAsync();

        expect(attributeFilterHandler.getInitTotalCountStatus()).toBe("success");
    });

    it("initTotalCount() should call success callback", async () => {
        const onInitTotalCountSuccess = vi.fn();

        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init("start");

        await waitForAsync();

        attributeFilterHandler.onInitTotalCountSuccess(onInitTotalCountSuccess);
        attributeFilterHandler.initTotalCount("start");

        await waitForAsync();

        expect(onInitTotalCountSuccess).toHaveBeenCalledTimes(1);
        expect(onInitTotalCountSuccess.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("initTotalCount() should call cancel callback", async () => {
        const onInitTotalCountCancel = vi.fn();

        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init("start");

        await waitForAsync();

        attributeFilterHandler.onInitTotalCountCancel(onInitTotalCountCancel);
        attributeFilterHandler.initTotalCount("start");
        attributeFilterHandler.initTotalCount("start");

        await waitForAsync();

        expect(onInitTotalCountCancel).toHaveBeenCalledTimes(1);
        expect(onInitTotalCountCancel.mock.calls[0]).toMatchSnapshot("with parameters");
    });
});
