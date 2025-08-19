// (C) 2007-2025 GoodData Corporation
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IGdcMessageEvent } from "../../iframe/common.js";
import { addListener, postEvent, removeListener, setConfig, setHost } from "../messagingUtils.js";

describe("Post events", () => {
    const event = {
        data: {
            gdc: {
                product: "productName",
                event: {
                    name: "postEventName",
                    data: { foo: "bar" },
                },
            },
        },
    };

    it("should call postEvent on host", () => {
        const host = { postMessage: vi.fn() };

        setHost(host);

        postEvent("productName", "postEventName", { foo: "bar" });

        expect(host.postMessage).toHaveBeenCalledWith(event.data, "*");
    });

    describe("post events listener", () => {
        setConfig("productName", ["postEventName"]);

        let listener: any = null;
        let target: any = null;

        beforeEach(() => {
            listener = (e: IGdcMessageEvent<string, string, any>) => e.data.gdc.event.data;
            target = {
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            };
        });

        it('should add post event listener of type "message" to target', () => {
            addListener(listener, target);

            expect(target.addEventListener).toHaveBeenCalled();
            expect(target.addEventListener.mock.calls[0][0]).toBe("message");
            expect(typeof target.addEventListener.mock.calls[0][1]).toBe("function");
            expect(target.addEventListener.mock.calls[0][2]).toBe(false);
        });

        it("should remove existing post event listener from target", () => {
            addListener(listener, target);
            removeListener(listener, target);

            expect(target.removeEventListener).toHaveBeenCalled();
        });

        it("should not remove not existing post event listener from target", () => {
            removeListener(listener, target);

            expect(target.removeEventListener).not.toHaveBeenCalled();
        });

        it("should return event data on receiver call", () => {
            addListener(listener, target);
            const receiver = target.addEventListener.mock.calls[0][1];

            expect(receiver(event)).toEqual({ foo: "bar" });
        });
    });
});
