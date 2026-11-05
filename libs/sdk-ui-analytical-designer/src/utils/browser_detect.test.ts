// (C) 2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { isMobile } from "./browser_detect.js";

// Expected values are what jquery.browser 0.1.0 reported (`!$.browser.desktop`) for each user agent.
const DESKTOP_USER_AGENTS = {
    "Chrome on Windows":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Firefox on Windows": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
    "Safari on macOS":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
    // iPadOS asks for desktop sites by default and sends the macOS user agent
    "Safari on iPadOS in desktop mode":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Chrome on Linux":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Chrome on ChromeOS":
        "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
};

const MOBILE_USER_AGENTS = {
    // the iOS user agents also name "Mac OS X", the Android ones "Linux", and Windows Phone "Windows"
    "Safari on iPhone":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
    "Safari on iPad":
        "Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "Chrome on Android phone":
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
    "Chrome on Android tablet":
        "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Edge on Windows Phone":
        "Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Mobile Safari/537.36 Edge/15.15063",
    "Silk on Kindle Fire":
        "Mozilla/5.0 (Linux; U; Android 4.0.3; en-us; KFTT Build/IML74K) AppleWebKit/537.36 (KHTML, like Gecko) Silk/3.68 like Chrome/39.0.2171.93 Safari/537.36",
    "BlackBerry 10":
        "Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+",
    // no known platform token: jquery.browser did not mark these as desktop either
    "Firefox on FreeBSD": "Mozilla/5.0 (X11; FreeBSD amd64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "an empty user agent": "",
};

describe("isMobile", () => {
    it.each(Object.entries(DESKTOP_USER_AGENTS))("classifies %s as desktop", (_name, userAgent) => {
        expect(isMobile(userAgent)).toBe(false);
    });

    it.each(Object.entries(MOBILE_USER_AGENTS))("classifies %s as mobile", (_name, userAgent) => {
        expect(isMobile(userAgent)).toBe(true);
    });

    it("reads the user agent of the current window by default", () => {
        vi.stubGlobal("window", { navigator: { userAgent: MOBILE_USER_AGENTS["Safari on iPhone"] } });

        expect(isMobile()).toBe(true);
    });
});
