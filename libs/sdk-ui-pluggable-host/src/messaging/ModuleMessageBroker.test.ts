// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import {
    type IModuleMessage,
    type IModuleMessagingError,
    type ModuleMessagingErrorCode,
    isModuleMessagingError,
} from "@gooddata/sdk-pluggable-application-model";

import { type IModuleMessageBrokerDependencies, ModuleMessageBroker } from "./ModuleMessageBroker.js";

const QUEUE = "gdc.exportQueue.v1";
const QUEUE_V2 = "gdc.exportQueue.v2";

function message(type: string, payload?: unknown, channel = QUEUE): IModuleMessage {
    return { channel, type, payload };
}

function setup(deps: Partial<IModuleMessageBrokerDependencies> = {}) {
    const reportFailure = vi.fn();
    const warn = vi.fn();
    const broker = new ModuleMessageBroker({ reportFailure, warn, ...deps });
    return { broker, reportFailure, warn };
}

async function errorCodeOf(promise: Promise<unknown>): Promise<ModuleMessagingErrorCode | "resolved"> {
    try {
        await promise;
        return "resolved";
    } catch (error) {
        expect(isModuleMessagingError(error)).toBe(true);
        return (error as IModuleMessagingError).code;
    }
}

async function flush(): Promise<void> {
    for (let i = 0; i < 5; i++) {
        await Promise.resolve();
    }
}

describe("ModuleMessageBroker", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    describe("requests", () => {
        it("routes a request to the channel owner and resolves with a copy of the reply", async () => {
            const { broker } = setup();
            const reply = { jobId: "j1" };
            const handler = vi.fn(() => reply);
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, handler);
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            const result = await app.messaging.request(message("job.start", { id: "d1" }));

            expect(result).toEqual(reply);
            expect(result).not.toBe(reply);
            expect(handler).toHaveBeenCalledWith(
                message("job.start", { id: "d1" }),
                expect.objectContaining({
                    sender: { kind: "application", id: "dashboards" },
                    expectsReply: true,
                }),
            );
        });

        it("waits for the modules to settle before it resolves an unknown channel", async () => {
            const { broker } = setup();
            const app = broker.attachApplication("dashboards");

            const pending = app.messaging.request(message("job.start"));
            await flush();
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, () => "late owner");
            broker.markSettled();

            await expect(pending).resolves.toBe("late owner");
        });

        it("fails with channel-not-found only after the modules settle", async () => {
            const { broker } = setup();
            const app = broker.attachApplication("dashboards");
            const pending = errorCodeOf(app.messaging.request(message("job.start")));
            let finished = false;
            void pending.then(() => {
                finished = true;
            });

            await flush();
            expect(finished).toBe(false);
            broker.markSettled();

            await expect(pending).resolves.toBe("channel-not-found");
        });

        it("matches channel names exactly", async () => {
            const { broker } = setup();
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, () => "v1");
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            expect(await errorCodeOf(app.messaging.request(message("x", undefined, QUEUE_V2)))).toBe(
                "channel-not-found",
            );
            expect(
                await errorCodeOf(app.messaging.request(message("x", undefined, QUEUE.toUpperCase()))),
            ).toBe("channel-not-found");
            await expect(app.messaging.hasChannel(QUEUE)).resolves.toBe(true);
            await expect(app.messaging.hasChannel(QUEUE_V2)).resolves.toBe(false);
        });

        it("times out and aborts the handler signal", async () => {
            vi.useFakeTimers();
            const { broker } = setup();
            let signal: AbortSignal | undefined;
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, (_message, context) => {
                signal = context.signal;
                return new Promise(() => undefined);
            });
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            const pending = errorCodeOf(app.messaging.request(message("job.start"), { timeoutMs: 50 }));
            await vi.advanceTimersByTimeAsync(50);

            await expect(pending).resolves.toBe("timeout");
            expect(signal?.aborted).toBe(true);
        });

        it("aborts a request when the caller signal aborts", async () => {
            const { broker } = setup();
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, () => new Promise(() => undefined));
            broker.markSettled();
            const app = broker.attachApplication("dashboards");
            const controller = new AbortController();

            const pending = errorCodeOf(
                app.messaging.request(message("job.start"), { signal: controller.signal }),
            );
            controller.abort();

            await expect(pending).resolves.toBe("aborted");
        });

        it("fails with handler-failed without reporting a module failure when the handler throws", async () => {
            const { broker, reportFailure } = setup();
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, () => {
                throw new Error("bad payload");
            });
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            expect(await errorCodeOf(app.messaging.request(message("job.start")))).toBe("handler-failed");
            expect(reportFailure).not.toHaveBeenCalled();
        });

        it("fails with invalid-message for an invalid envelope or a payload that cannot be cloned", async () => {
            const { broker } = setup();
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, () => "ok");
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            expect(
                await errorCodeOf(app.messaging.request({ channel: "", type: "x" } as IModuleMessage)),
            ).toBe("invalid-message");
            expect(await errorCodeOf(app.messaging.request(message("x", { run: () => undefined })))).toBe(
                "invalid-message",
            );
        });

        it("rejects the pending requests with recipient-unmounted when the owner unmounts", async () => {
            const { broker } = setup();
            const owner = broker.connectHeadlessModule("queue");
            let signal: AbortSignal | undefined;
            owner.registerChannel(QUEUE, (_message, context) => {
                signal = context.signal;
                return new Promise(() => undefined);
            });
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            const pending = errorCodeOf(app.messaging.request(message("job.start")));
            await flush();
            owner.close();

            await expect(pending).resolves.toBe("recipient-unmounted");
            expect(signal?.aborted).toBe(true);
            await expect(app.messaging.hasChannel(QUEUE)).resolves.toBe(false);
        });

        it("delivers requests of one sender to one channel in order, even across the settle wait", async () => {
            const { broker } = setup();
            const app = broker.attachApplication("dashboards");
            const received: string[] = [];

            const first = app.messaging.request(message("first"));
            await flush();
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, (m) => {
                received.push(m.type);
            });
            const second = app.messaging.request(message("second"));
            broker.markSettled();
            await Promise.all([first, second]);

            expect(received).toEqual(["first", "second"]);
        });

        it("gives handlers a sender identity they cannot change", async () => {
            const { broker } = setup();
            const senders: Array<{ kind: string; id: string }> = [];
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, (_message, { sender }) => {
                senders.push({ ...sender });
                try {
                    (sender as { id: string }).id = "admin";
                } catch {
                    // frozen in strict mode
                }
            });
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            await app.messaging.request(message("first"));
            await app.messaging.request(message("second"));

            expect(senders).toEqual([
                { kind: "application", id: "dashboards" },
                { kind: "application", id: "dashboards" },
            ]);
        });

        it("does not hold later requests behind a request that timed out while waiting to settle", async () => {
            vi.useFakeTimers();
            const { broker } = setup();
            const first = broker.attachApplication("dashboards");
            const stale = errorCodeOf(first.messaging.request(message("stale"), { timeoutMs: 50 }));
            await vi.advanceTimersByTimeAsync(50);
            await expect(stale).resolves.toBe("timeout");

            broker.connectHeadlessModule("queue").registerChannel(QUEUE, () => "fresh reply");
            const remounted = broker.attachApplication("dashboards");

            await expect(remounted.messaging.request(message("fresh"), { timeoutMs: 50 })).resolves.toBe(
                "fresh reply",
            );
        });

        it("delivers a waiting request as soon as its channel registers, before the modules settle", async () => {
            vi.useFakeTimers();
            const { broker } = setup();
            const app = broker.attachApplication("dashboards");
            const pending = app.messaging.request(message("early"), { timeoutMs: 100 });
            const hasChannel = app.messaging.hasChannel(QUEUE);
            await vi.advanceTimersByTimeAsync(10);

            broker.connectHeadlessModule("queue").registerChannel(QUEUE, () => "served before settle");

            await expect(pending).resolves.toBe("served before settle");
            await expect(hasChannel).resolves.toBe(true);
            await expect(app.messaging.request(message("later"), { timeoutMs: 100 })).resolves.toBe(
                "served before settle",
            );
        });

        it("never runs the handler inside the caller's stack", async () => {
            const { broker } = setup();
            const handler = vi.fn();
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, handler);
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            const pending = app.messaging.request(message("job.start"));
            expect(handler).not.toHaveBeenCalled();
            await pending;
            expect(handler).toHaveBeenCalledTimes(1);
        });

        it("caps a timeout that setTimeout cannot hold instead of firing at once", async () => {
            vi.useFakeTimers();
            const { broker } = setup();
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, () => new Promise(() => undefined));
            broker.markSettled();
            const app = broker.attachApplication("dashboards");
            let finished = false;

            void app.messaging.request(message("x"), { timeoutMs: Number.POSITIVE_INFINITY }).catch(() => {
                finished = true;
            });
            await vi.advanceTimersByTimeAsync(60_000);

            expect(finished).toBe(false);
        });

        it("waits in hasChannel for a slow module and resolves false when the mount attempt detaches", async () => {
            vi.useFakeTimers();
            const { broker } = setup();
            const slow = broker.attachApplication("dashboards").messaging.hasChannel(QUEUE);
            let answered = false;
            void slow.then(() => {
                answered = true;
            });
            await vi.advanceTimersByTimeAsync(60_000);
            expect(answered).toBe(false);
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, () => undefined);
            broker.markSettled();
            await expect(slow).resolves.toBe(true);

            const app = setup().broker.attachApplication("dashboards");
            const detached = app.messaging.hasChannel(QUEUE);
            app.detach();
            await expect(detached).resolves.toBe(false);
        });

        it("calls the handler of a notification without a reply", async () => {
            const { broker } = setup();
            const handler = vi.fn();
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, handler);
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            app.messaging.notify(message("ping"));
            await flush();

            expect(handler).toHaveBeenCalledWith(
                message("ping"),
                expect.objectContaining({ expectsReply: false }),
            );
        });
    });

    describe("channel registry", () => {
        it("throws when a second module registers a taken channel and keeps the first owner", async () => {
            const { broker } = setup();
            broker.connectHeadlessModule("first").registerChannel(QUEUE, () => "first");

            expect(() =>
                broker.connectHeadlessModule("second").registerChannel(QUEUE, () => "second"),
            ).toThrow(/already owned/);
            broker.markSettled();
            await expect(
                broker.attachApplication("dashboards").messaging.request(message("x")),
            ).resolves.toBe("first");
        });

        it("serves two versions from one module and keeps one when the other is removed", async () => {
            const { broker } = setup();
            const port = broker.connectHeadlessModule("queue");
            const removeV1 = port.registerChannel(QUEUE, () => "v1");
            port.registerChannel(QUEUE_V2, () => "v2");
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            await expect(app.messaging.request(message("x"))).resolves.toBe("v1");
            removeV1();

            expect(await errorCodeOf(app.messaging.request(message("x")))).toBe("channel-not-found");
            await expect(app.messaging.request(message("x", undefined, QUEUE_V2))).resolves.toBe("v2");
        });

        it("warns once about a name that breaks the convention but still routes it", async () => {
            const { broker, warn } = setup();
            broker.connectHeadlessModule("queue").registerChannel("queue", () => "ok");
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            await expect(app.messaging.request(message("x", undefined, "queue"))).resolves.toBe("ok");
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('"queue"'));
        });

        it("rejects an empty channel name", () => {
            const { broker } = setup();

            expect(() => broker.connectHeadlessModule("queue").registerChannel("", () => "ok")).toThrow();
        });
    });

    describe("posts to the active application", () => {
        it("queues posts until the application is ready and replays them in order", async () => {
            const { broker } = setup();
            const port = broker.connectHeadlessModule("queue");
            port.registerChannel(QUEUE, () => undefined);
            const app = broker.attachApplication("dashboards");
            const onModuleMessage = vi.fn();

            expect(port.postToActiveApplication(message("one"))).toBe("queued");
            expect(port.postToActiveApplication(message("two"))).toBe("queued");
            app.ready({ onModuleMessage });
            expect(port.postToActiveApplication(message("three"))).toBe("delivered");
            await flush();

            expect(onModuleMessage.mock.calls.map(([m]) => m.type)).toEqual(["one", "two", "three"]);
            expect(onModuleMessage).toHaveBeenCalledWith(message("one"), { kind: "headless", id: "queue" });
        });

        it("drops queued posts when the mount attempt detaches", async () => {
            const { broker } = setup();
            const port = broker.connectHeadlessModule("queue");
            port.registerChannel(QUEUE, () => undefined);
            const first = broker.attachApplication("dashboards");
            port.postToActiveApplication(message("stale"));
            const onModuleMessage = vi.fn();

            first.detach();
            expect(port.postToActiveApplication(message("nobody"))).toBe("no-receiver");
            const second = broker.attachApplication("dashboards");
            second.ready({ onModuleMessage });
            first.ready({ onModuleMessage });
            await flush();

            expect(onModuleMessage).not.toHaveBeenCalled();
        });

        it("delivers only the accepted channels", async () => {
            const { broker } = setup();
            const port = broker.connectHeadlessModule("queue");
            port.registerChannel(QUEUE, () => undefined);
            port.registerChannel(QUEUE_V2, () => undefined);
            const app = broker.attachApplication("dashboards");
            const onModuleMessage = vi.fn();
            port.postToActiveApplication(message("queued-v1"));
            port.postToActiveApplication(message("queued-v2", undefined, QUEUE_V2));

            app.ready({ onModuleMessage, acceptedChannels: [QUEUE_V2] });

            expect(port.postToActiveApplication(message("live-v1"))).toBe("no-receiver");
            expect(port.postToActiveApplication(message("live-v2", undefined, QUEUE_V2))).toBe("delivered");
            await flush();
            expect(onModuleMessage.mock.calls.map(([m]) => m.type)).toEqual(["queued-v2", "live-v2"]);
        });

        it("reports no-receiver when the application has no onModuleMessage", () => {
            const { broker } = setup();
            const port = broker.connectHeadlessModule("queue");
            port.registerChannel(QUEUE, () => undefined);
            broker.attachApplication("dashboards").ready({});

            expect(port.postToActiveApplication(message("x"))).toBe("no-receiver");
        });

        it("reports an async onModuleMessage that rejects", async () => {
            const { broker, reportFailure } = setup();
            const port = broker.connectHeadlessModule("queue");
            port.registerChannel(QUEUE, () => undefined);
            broker.attachApplication("dashboards").ready({
                onModuleMessage: () => Promise.reject(new Error("async app failure")),
            });

            port.postToActiveApplication(message("x"));
            await flush();

            expect(reportFailure).toHaveBeenCalledWith(
                { kind: "application", id: "dashboards" },
                expect.stringContaining("async app failure"),
            );
        });

        it("rejects a post on a channel that the module does not own", () => {
            const { broker } = setup();
            broker.connectHeadlessModule("owner").registerChannel(QUEUE, () => undefined);
            broker.attachApplication("dashboards").ready({ onModuleMessage: vi.fn() });

            expect(broker.connectHeadlessModule("intruder").postToActiveApplication(message("x"))).toBe(
                "rejected",
            );
        });

        it("isolates a throwing onModuleMessage and reports the application", async () => {
            const { broker, reportFailure } = setup();
            const port = broker.connectHeadlessModule("queue");
            port.registerChannel(QUEUE, () => undefined);
            broker.attachApplication("dashboards").ready({
                onModuleMessage: () => {
                    throw new Error("app failed");
                },
            });

            port.postToActiveApplication(message("x"));
            await flush();

            expect(reportFailure).toHaveBeenCalledWith(
                { kind: "application", id: "dashboards" },
                expect.stringContaining("app failed"),
            );
        });
    });

    describe("active application changes", () => {
        it("tells the modules when an application is ready and when it detaches", () => {
            const { broker } = setup();
            const listener = vi.fn();
            broker.connectHeadlessModule("queue").setActiveApplicationListener(listener);
            const app = broker.attachApplication("dashboards");

            app.ready({ acceptedChannels: [QUEUE_V2, QUEUE] });
            app.detach();

            expect(listener.mock.calls).toEqual([
                [{ id: "dashboards", acceptedChannels: [QUEUE_V2, QUEUE] }],
                [undefined],
            ]);
        });

        it("tells a module that connects later about the application that is already ready", async () => {
            const { broker } = setup();
            broker.attachApplication("dashboards").ready({});
            const listener = vi.fn();

            broker.connectHeadlessModule("queue").setActiveApplicationListener(listener);
            await flush();

            expect(listener).toHaveBeenCalledWith({ id: "dashboards", acceptedChannels: undefined });
        });

        it("reports a listener that returns a rejecting thenable", async () => {
            const { broker, reportFailure } = setup();
            const thenable: PromiseLike<void> = {
                then: (_resolve, reject) => {
                    reject?.(new Error("thenable failed"));
                    return thenable as never;
                },
            };
            broker.connectHeadlessModule("broken").setActiveApplicationListener(() => thenable as never);

            broker.attachApplication("dashboards").ready({});
            await flush();

            expect(reportFailure).toHaveBeenCalledWith(
                { kind: "headless", id: "broken" },
                expect.stringContaining("thenable failed"),
            );
        });

        it("isolates a throwing listener", () => {
            const { broker, reportFailure } = setup();
            broker.connectHeadlessModule("broken").setActiveApplicationListener(() => {
                throw new Error("listener failed");
            });
            const healthy = vi.fn();
            broker.connectHeadlessModule("healthy").setActiveApplicationListener(healthy);

            broker.attachApplication("dashboards").ready({});

            expect(healthy).toHaveBeenCalled();
            expect(reportFailure).toHaveBeenCalledWith(
                { kind: "headless", id: "broken" },
                expect.stringContaining("listener failed"),
            );
        });
    });

    describe("lifetimes", () => {
        it("aborts the requests of an application mount attempt when it detaches", async () => {
            const { broker } = setup();
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, () => new Promise(() => undefined));
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            const pending = errorCodeOf(app.messaging.request(message("job.start")));
            await flush();
            broker.attachApplication("dashboards");

            await expect(pending).resolves.toBe("aborted");
            expect(await errorCodeOf(app.messaging.request(message("again")))).toBe("aborted");
        });

        it("serves module-to-module requests and waits for a module that mounts later", async () => {
            const { broker } = setup();
            const analytics = broker.connectHeadlessModule("analytics");

            const pending = analytics.moduleMessaging.request(
                message("consent.get", undefined, "gdc.consent.v1"),
            );
            await flush();
            const handler = vi.fn(() => ({ analytics: true }));
            broker.connectHeadlessModule("consent").registerChannel("gdc.consent.v1", handler);
            broker.markSettled();

            await expect(pending).resolves.toEqual({ analytics: true });
            expect(handler).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ sender: { kind: "headless", id: "analytics" } }),
            );
        });

        it("rejects a module request to its own channel", async () => {
            const { broker } = setup();
            const port = broker.connectHeadlessModule("queue");
            port.registerChannel(QUEUE, () => "self");
            broker.markSettled();

            expect(await errorCodeOf(port.moduleMessaging.request(message("x")))).toBe("invalid-message");
        });

        it("aborts the requests of a module when it closes", async () => {
            const { broker } = setup();
            broker
                .connectHeadlessModule("consent")
                .registerChannel("gdc.consent.v1", () => new Promise(() => undefined));
            broker.markSettled();
            const analytics = broker.connectHeadlessModule("analytics");

            const pending = errorCodeOf(
                analytics.moduleMessaging.request(message("x", undefined, "gdc.consent.v1")),
            );
            await flush();
            analytics.close();

            await expect(pending).resolves.toBe("aborted");
        });

        it("rejects everything pending and refuses new work after dispose", async () => {
            const { broker } = setup();
            broker.connectHeadlessModule("queue").registerChannel(QUEUE, () => new Promise(() => undefined));
            broker.markSettled();
            const app = broker.attachApplication("dashboards");

            const pending = errorCodeOf(app.messaging.request(message("x")));
            await flush();
            broker.dispose();

            await expect(pending).resolves.toBe("aborted");
            expect(await errorCodeOf(broker.attachApplication("other").messaging.request(message("x")))).toBe(
                "aborted",
            );
        });
    });
});
