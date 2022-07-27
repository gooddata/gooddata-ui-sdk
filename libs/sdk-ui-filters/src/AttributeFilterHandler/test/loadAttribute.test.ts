// (C) 2019-2022 GoodData Corporation
import { newTestAttributeFilterHandler } from "./fixtures";
import { waitForAsync } from "./testUtils";

describe("AttributeFilterHandler", () => {
    it("getAttribute() should return the attribute after successful initialization", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();

        await waitForAsync();

        expect(attributeFilterHandler.getAttribute()).toMatchSnapshot();
    });

    it("getAttribute() should return the attribute after successful loadAttribute() call", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();
        attributeFilterHandler.loadAttribute();
        await waitForAsync();

        expect(attributeFilterHandler.getAttribute()).toMatchSnapshot();
    });

    it("loadAttribute() should trigger onLoadAttributeStart() callback", async () => {
        const onLoadAttributeStart = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadAttributeStart(onLoadAttributeStart);
        attributeFilterHandler.loadAttribute("start");

        await waitForAsync();

        expect(onLoadAttributeStart).toHaveBeenCalledTimes(1);
        expect(onLoadAttributeStart.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadAttribute() that was successful should trigger onLoadAttributeSuccess() callback", async () => {
        const onLoadAttributeSuccess = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadAttributeSuccess(onLoadAttributeSuccess);
        attributeFilterHandler.loadAttribute("success");

        await waitForAsync();

        expect(onLoadAttributeSuccess).toHaveBeenCalledTimes(1);
        expect(onLoadAttributeSuccess.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadAttribute() that failed should trigger onLoadAttributeError() callback", async () => {
        const onLoadAttributeError = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadAttributeError(onLoadAttributeError);
        attributeFilterHandler.loadAttribute("error");

        await waitForAsync();

        expect(onLoadAttributeError).toHaveBeenCalledTimes(1);
        expect(onLoadAttributeError.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadAttribute() that was canceled by another loadAttribute() call should trigger onLoadAttributeCancel() callback", async () => {
        const onLoadAttributeCancel = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadAttributeCancel(onLoadAttributeCancel);
        attributeFilterHandler.loadAttribute("cancel");
        attributeFilterHandler.loadAttribute();

        await waitForAsync();

        expect(onLoadAttributeCancel).toHaveBeenCalledTimes(1);
        expect(onLoadAttributeCancel.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("loadAttribute() that was canceled by cancelAttributeLoad() call should trigger onLoadAttributeCancel() callback", async () => {
        const onLoadAttributeCancel = jest.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.init();
        await waitForAsync();

        attributeFilterHandler.onLoadAttributeCancel(onLoadAttributeCancel);
        attributeFilterHandler.loadAttribute("cancel");
        attributeFilterHandler.cancelAttributeLoad();
        await waitForAsync();

        expect(onLoadAttributeCancel).toHaveBeenCalledTimes(1);
        expect(onLoadAttributeCancel.mock.calls[0]).toMatchSnapshot("with parameters");
    });

    it("getAttributeStatus() should return proper status for successful load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        expect(attributeFilterHandler.getAttributeStatus()).toMatchSnapshot("before the load");

        attributeFilterHandler.init();

        expect(attributeFilterHandler.getAttributeStatus()).toMatchSnapshot("during the load");

        await waitForAsync();

        expect(attributeFilterHandler.getAttributeStatus()).toMatchSnapshot("after the load");
    });

    it("getAttributeStatus() should return proper status for failed load", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        expect(attributeFilterHandler.getAttributeStatus()).toMatchSnapshot("before the load");

        attributeFilterHandler.init();

        expect(attributeFilterHandler.getAttributeStatus()).toMatchSnapshot("during the load");

        await waitForAsync();

        expect(attributeFilterHandler.getAttributeStatus()).toMatchSnapshot("after the load");
    });

    it("getAttributeError() should return error", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("nonExisting");

        attributeFilterHandler.init();

        await waitForAsync();

        expect(attributeFilterHandler.getAttributeError()).toMatchSnapshot();
    });
});
