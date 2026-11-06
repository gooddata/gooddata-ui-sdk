// (C) 2026 GoodData Corporation

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { DESKTOP_VIEWPORT } from "./test/viewport.js";

afterEach(() => {
    cleanup();
    // Note that files running only in Node do not have sessionStorage and the happy-dom window
    globalThis.window?.happyDOM?.setViewport(DESKTOP_VIEWPORT);
    globalThis.sessionStorage?.clear();
    vi.useRealTimers();
});
