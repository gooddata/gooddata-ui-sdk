// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { installHostAdapter } from "../../embedding/hostBridge.js";

import { METRICS_CHANGED_EVENT, metricsChanged } from "./metrics_changed_events.js";

describe("metricsChanged", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("delivers the event to the in-process host", () => {
        const onEvent = vi.fn();
        const uninstall = installHostAdapter({ onEvent });

        metricsChanged();
        uninstall();

        expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ name: METRICS_CHANGED_EVENT }));
    });

    it("posts nothing to an iframe parent", () => {
        const postMessage = vi.spyOn(window.parent, "postMessage");

        metricsChanged();

        expect(postMessage).not.toHaveBeenCalled();
    });
});
