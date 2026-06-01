// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IHostUiMountHandle, type IHostUiNotification } from "@gooddata/sdk-pluggable-application-model";

// Module-level state in hostNotifications.ts persists between tests in the same file,
// so reset modules in beforeEach to give each test a clean slate.
let dispatchHostNotification: typeof import("../hostNotifications.js").dispatchHostNotification;
let setActiveHostHandle: typeof import("../hostNotifications.js").setActiveHostHandle;

beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../hostNotifications.js");
    dispatchHostNotification = mod.dispatchHostNotification;
    setActiveHostHandle = mod.setActiveHostHandle;
});

const NEW_DEPLOYMENT: IHostUiNotification = { type: "newDeploymentAvailable", commitHash: "abc" };

function makeHandle(notify: IHostUiMountHandle["notify"] = vi.fn()): IHostUiMountHandle {
    return {
        unmount: vi.fn(),
        getAppContainer: vi.fn(() => document.createElement("div")),
        notify,
    };
}

describe("dispatchHostNotification", () => {
    it("delivers directly when a handle is registered", () => {
        const notify = vi.fn();
        setActiveHostHandle(makeHandle(notify));

        dispatchHostNotification(NEW_DEPLOYMENT);

        expect(notify).toHaveBeenCalledWith(NEW_DEPLOYMENT);
        expect(notify).toHaveBeenCalledTimes(1);
    });

    it("queues notifications dispatched before any handle is registered", () => {
        const notify = vi.fn();

        dispatchHostNotification(NEW_DEPLOYMENT);
        // No handle yet — should be queued, not dropped.
        expect(notify).not.toHaveBeenCalled();

        setActiveHostHandle(makeHandle(notify));

        expect(notify).toHaveBeenCalledWith(NEW_DEPLOYMENT);
        expect(notify).toHaveBeenCalledTimes(1);
    });

    it("flushes queued notifications in arrival order on register", () => {
        const notify = vi.fn();

        const first: IHostUiNotification = { type: "newDeploymentAvailable", commitHash: "first" };
        const second: IHostUiNotification = { type: "newDeploymentAvailable", commitHash: "second" };
        const third: IHostUiNotification = { type: "newDeploymentAvailable", commitHash: "third" };

        dispatchHostNotification(first);
        dispatchHostNotification(second);
        dispatchHostNotification(third);

        setActiveHostHandle(makeHandle(notify));

        expect(notify.mock.calls.map((c) => c[0])).toEqual([first, second, third]);
    });

    it("queues again after the handle is cleared", () => {
        const initialNotify = vi.fn();
        setActiveHostHandle(makeHandle(initialNotify));
        setActiveHostHandle(undefined);

        dispatchHostNotification(NEW_DEPLOYMENT);
        expect(initialNotify).not.toHaveBeenCalled();

        const replacementNotify = vi.fn();
        setActiveHostHandle(makeHandle(replacementNotify));

        expect(replacementNotify).toHaveBeenCalledWith(NEW_DEPLOYMENT);
        expect(replacementNotify).toHaveBeenCalledTimes(1);
    });

    it("drops the oldest entry when the queue overflows beyond the cap", () => {
        const MAX = 16;
        const dispatched: IHostUiNotification[] = [];

        for (let i = 0; i < MAX + 5; i++) {
            const n: IHostUiNotification = { type: "newDeploymentAvailable", commitHash: `c${i}` };
            dispatched.push(n);
            dispatchHostNotification(n);
        }

        const notify = vi.fn();
        setActiveHostHandle(makeHandle(notify));

        // The oldest 5 entries (c0..c4) should be dropped; c5..c20 should remain in order.
        expect(notify).toHaveBeenCalledTimes(MAX);
        const delivered = notify.mock.calls.map((c) => c[0]);
        expect(delivered).toEqual(dispatched.slice(5));
    });

    it("does not flush when the registered handle has no notify implementation", () => {
        const handleWithoutNotify: IHostUiMountHandle = {
            unmount: vi.fn(),
            getAppContainer: vi.fn(() => document.createElement("div")),
            // notify omitted — UI module opts out of receiving notifications.
        };

        dispatchHostNotification(NEW_DEPLOYMENT);
        setActiveHostHandle(handleWithoutNotify);

        // Subsequent dispatch with the same handle should also be a no-op (not queue, not throw).
        dispatchHostNotification({ type: "newDeploymentAvailable", commitHash: "second" });

        // Re-registering a handle that DOES implement notify should still flush the queue
        // from before the no-notify handle took over.
        const replacement = vi.fn();
        setActiveHostHandle(makeHandle(replacement));
        expect(replacement).toHaveBeenCalledWith(NEW_DEPLOYMENT);
    });
});
