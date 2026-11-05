// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IBootstrapData, bootstrapData } from "./app_context_actions.js";

const DESKTOP_USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const MOBILE_USER_AGENT =
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";

const fakeWindow = (devicePixelRatio?: number) =>
    ({
        // a vertical scrollbar takes 15px out of the layout viewport
        innerWidth: 1295,
        innerHeight: 720,
        document: { documentElement: { clientWidth: 1280, clientHeight: 705 } },
        devicePixelRatio,
    }) as unknown as Window;

const data = { user: { language: "en-US" } } as IBootstrapData;

describe("bootstrapData", () => {
    it("reports the viewport without scrollbars, as jQuery's $(window).width() / .height() did", () => {
        const { windowInfo } = bootstrapData(data, fakeWindow(2)).payload;

        expect(windowInfo.viewport).toBe("1280x705");
        expect(windowInfo.pixelRatio).toBe(2);
    });

    it("falls back to a pixel ratio of 1 when the window does not report one", () => {
        expect(bootstrapData(data, fakeWindow()).payload.windowInfo.pixelRatio).toBe(1);
    });

    it("measures the global window by default", () => {
        const { clientWidth, clientHeight } = window.document.documentElement;

        expect(bootstrapData(data).payload.windowInfo.viewport).toBe(`${clientWidth}x${clientHeight}`);
    });

    it.each([
        [DESKTOP_USER_AGENT, false],
        [MOBILE_USER_AGENT, true],
    ])("classifies the device from the user agent %s", (userAgent, expected) => {
        vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(userAgent);

        expect(bootstrapData(data, fakeWindow(1)).payload.windowInfo.isMobileDevice).toBe(expected);
    });
});
