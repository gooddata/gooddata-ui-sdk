// (C) 2022-2026 GoodData Corporation

// @vitest-environment happy-dom

import { createElement, useEffect } from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { idRef } from "@gooddata/sdk-model";

const timeout = 20000;
const renderSpy = vi.fn();
const clearInsightViewCacheForInsightSpy = vi.fn();
let autoCompleteOnMount = false;

function MockInsightView(props: Record<string, unknown>) {
    const onLoadingChanged = props["onLoadingChanged"] as
        | ((state: { isLoading: boolean }) => void)
        | undefined;

    useEffect(() => {
        if (autoCompleteOnMount) {
            onLoadingChanged?.({ isLoading: false });
        }
    }, [onLoadingChanged]);

    return createElement("div");
}

vi.mock("@gooddata/sdk-ui-ext", () => ({
    InsightView: (props: Record<string, unknown>) => {
        renderSpy(props);
        return createElement(MockInsightView, props);
    },
    clearInsightViewCacheForInsight: clearInsightViewCacheForInsightSpy,
}));

const flushMicrotasks = async (count = 4) => {
    for (let i = 0; i < count; i += 1) {
        await Promise.resolve();
    }

    await new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
};

// `fromIndex` lets a caller scan only render calls that happened at or after a point it
// captured itself (typically `renderSpy.mock.calls.length` taken right before triggering a
// remount). This makes "does this props object belong to the post-remount render" a structural
// check instead of relying on the incidental fact that the pre-remount phase produced exactly
// one render call - if it ever produces more, a `props !== initialProps` predicate scanning
// from 0 could otherwise match an earlier, still-pre-remount render.
const waitForRenderProps = async (
    predicate: (props: Record<string, unknown>) => boolean,
    {
        timeout: waitTimeout = timeout,
        interval = 10,
        fromIndex = 0,
    }: { timeout?: number; interval?: number; fromIndex?: number } = {},
) => {
    const deadline = Date.now() + waitTimeout;
    let scannedIndex = fromIndex;

    for (;;) {
        const calls = renderSpy.mock.calls;
        for (; scannedIndex < calls.length; scannedIndex++) {
            const props = calls[scannedIndex]?.[0] as Record<string, unknown> | undefined;
            if (props && predicate(props)) {
                return props;
            }
        }

        if (Date.now() >= deadline) {
            const props = renderSpy.mock.lastCall?.[0] as Record<string, unknown> | undefined;
            throw new Error(
                `waitForRenderProps timed out after ${waitTimeout}ms; last render props: ${JSON.stringify(
                    props,
                )}`,
            );
        }

        await flushMicrotasks(1);
        await new Promise((resolve) => {
            setTimeout(resolve, interval);
        });
    }
};

describe("Insight", () => {
    beforeEach(() => {
        vi.resetModules();
        renderSpy.mockClear();
        clearInsightViewCacheForInsightSpy.mockReset();
        autoCompleteOnMount = false;
        document.body.innerHTML = "";
    });

    afterEach(async () => {
        // Unmount what this suite mounted instead of leaving it for whichever suite clears
        // `document.body` next - detaching an element unmounts a React root, and that should
        // happen while this suite still owns the DOM.
        document.body.innerHTML = "";
        await flushMicrotasks();
    });

    it(
        "registers gd-insight as the legacy runtime and gd-insight-embed as the strict runtime",
        async () => {
            const { Insight } = await import("../visualizations/Insight.js");
            const { InsightEmbed } = await import("../visualizations/InsightEmbed.js");

            // The custom element registry is owned by the environment, not by the module graph, so
            // it outlives the `vi.resetModules()` above and is shared with every other suite in the
            // same environment. Only the first registration of a tag name wins, which means reading
            // the real registry back would compare against whichever module instance happened to
            // import `index.js` first. Capture what `index.js` *asks* to register instead: that is
            // the wiring under test, and it holds no matter what ran before.
            const defined = new Map<string, CustomElementConstructor>();
            const getSpy = vi.spyOn(window.customElements, "get").mockReturnValue(undefined);
            const defineSpy = vi
                .spyOn(window.customElements, "define")
                .mockImplementation((name, constructor) => {
                    defined.set(name, constructor);
                });

            try {
                await import("../index.js");
            } finally {
                getSpy.mockRestore();
                defineSpy.mockRestore();
            }

            expect(defined.get("gd-insight")).toBe(Insight);
            expect(defined.get("gd-insight-embed")).toBe(InsightEmbed);
        },
        timeout,
    );

    it(
        "renders legacy gd-insight directly instead of wrapping gd-insight-embed",
        async () => {
            const { setContext } = await import("../context.js");
            const { Insight: InsightElement } = await import("../visualizations/Insight.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });

            const tagName = "test-legacy-gd-insight-direct";
            customElements.define(tagName, InsightElement);

            const element = document.createElement(tagName) as HTMLElement;
            element.setAttribute("insight", "first-insight");

            document.body.append(element);
            await waitForRenderProps((props) => props["insight"] === "first-insight");

            expect(element.querySelector("gd-insight-embed")).toBeNull();
            expect(renderSpy.mock.lastCall?.[0]).toMatchObject({
                insight: "first-insight",
            });

            element.setAttribute("insight", "second-insight");
            await waitForRenderProps((props) => props["insight"] === "second-insight");

            expect(element.querySelector("gd-insight-embed")).toBeNull();
            expect(renderSpy.mock.lastCall?.[0]).toMatchObject({
                insight: "second-insight",
            });
        },
        timeout,
    );

    it(
        "should prefer property snapshots over bootstrap attributes",
        async () => {
            const { setContext } = await import("../context.js");
            const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

            const defaultBackend = dummyBackend();
            const propertyBackend = dummyBackend();

            setContext({ backend: defaultBackend, workspaceId: "default-workspace" });

            const tagName = "test-gd-insight-props";
            customElements.define(tagName, InsightElement);

            const element = document.createElement(tagName) as HTMLElement & {
                context?: unknown;
                config?: unknown;
                insight?: string;
                filters?: unknown[];
                title?: unknown;
            };

            element.setAttribute("insight", "attribute-insight");
            element.setAttribute("title", "");
            element.setAttribute("filters", JSON.stringify([{ attributeFilter: "attribute" }]));

            document.body.append(element);
            element.context = { backend: propertyBackend, workspaceId: "property-workspace" };
            element.config = { separators: { thousand: "," } };
            element.insight = "property-insight";
            element.filters = [{ filter: "property" }];
            element.title = "Property Title";
            await waitForRenderProps((props) => props["insight"] === "property-insight");

            expect(renderSpy.mock.lastCall?.[0]).toMatchObject({
                backend: propertyBackend,
                workspace: "property-workspace",
                insight: "property-insight",
                filters: [{ filter: "property" }],
                showTitle: "Property Title",
                config: { separators: { thousand: "," } },
            });
        },
        timeout,
    );

    it(
        "should resolve refresh after the insight finishes loading",
        async () => {
            const { setContext } = await import("../context.js");
            const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });

            const tagName = "test-gd-insight-refresh";
            customElements.define(tagName, InsightElement);

            const element = document.createElement(tagName) as HTMLElement & {
                insight?: string;
                refresh: () => Promise<void>;
            };
            element.insight = "insight-id";

            document.body.append(element);

            const initialProps = await waitForRenderProps(
                (props) => typeof props["onLoadingChanged"] === "function",
            );

            const renderCountBeforeRefresh = renderSpy.mock.calls.length;
            const refreshPromise = element.refresh();
            const remountedProps = (await waitForRenderProps(
                (props) => props !== initialProps && typeof props["onLoadingChanged"] === "function",
                { fromIndex: renderCountBeforeRefresh },
            )) as {
                onLoadingChanged: (state: { isLoading: boolean }) => void;
            };

            remountedProps.onLoadingChanged({ isLoading: false });

            await expect(refreshPromise).resolves.toBeUndefined();
        },
        timeout,
    );

    it(
        "should remount the insight view when refresh is requested",
        async () => {
            const { setContext } = await import("../context.js");
            const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });
            autoCompleteOnMount = true;

            const tagName = "test-gd-insight-refresh-remount";
            customElements.define(tagName, InsightElement);

            const element = document.createElement(tagName) as HTMLElement & {
                insight?: string;
                refresh: () => Promise<void>;
            };
            element.insight = "insight-id";

            document.body.append(element);
            await flushMicrotasks();

            const initialRenderCount = renderSpy.mock.calls.length;
            const refreshPromise = element.refresh();
            await flushMicrotasks();

            await expect(refreshPromise).resolves.toBeUndefined();
            expect(renderSpy.mock.calls.length).toBeGreaterThan(initialRenderCount);
        },
        timeout,
    );

    it(
        "should invalidate the cached insight before remounting on refresh",
        async () => {
            const { setContext } = await import("../context.js");
            const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });

            const tagName = "test-gd-insight-refresh-invalidate";
            customElements.define(tagName, InsightElement);

            const element = document.createElement(tagName) as HTMLElement & {
                insight?: string;
                refresh: () => Promise<void>;
            };
            element.insight = "insight-id";

            document.body.append(element);

            const initialProps = await waitForRenderProps(
                (props) => typeof props["onLoadingChanged"] === "function",
            );
            const renderCountBeforeRefresh = renderSpy.mock.calls.length;
            const refreshPromise = element.refresh();

            const remountedProps = (await waitForRenderProps(
                (props) => props !== initialProps && typeof props["onLoadingChanged"] === "function",
                { fromIndex: renderCountBeforeRefresh },
            )) as { onLoadingChanged: (state: { isLoading: boolean }) => void };

            expect(clearInsightViewCacheForInsightSpy).toHaveBeenCalledTimes(1);
            expect(clearInsightViewCacheForInsightSpy).toHaveBeenCalledWith(
                "workspace",
                idRef("insight-id", "insight"),
            );

            // The eviction must happen strictly before the post-refresh remount, otherwise
            // the remounted InsightView would still read the stale cached promise.
            const remountCallIndex = renderSpy.mock.calls.findIndex(([props]) => props === remountedProps);
            const invalidationCallOrder = clearInsightViewCacheForInsightSpy.mock.invocationCallOrder[0];
            const remountCallOrder = renderSpy.mock.invocationCallOrder[remountCallIndex];
            expect(invalidationCallOrder).toBeLessThan(remountCallOrder!);

            remountedProps.onLoadingChanged({ isLoading: false });
            await expect(refreshPromise).resolves.toBeUndefined();
        },
        timeout,
    );

    it(
        // Regression test for the render-generation guard in GET_COMPONENT. A pre-refresh
        // InsightView keeps its callback closures after the remount, and its in-flight fetch can
        // complete afterwards - `InsightView` calls `onInsightLoaded` from inside the fetch
        // promise body, which is not cancellation-gated. Those late callbacks must not settle the
        // refresh that belongs to the remounted view, or `await refresh()` would report success
        // while the fresh insight is still loading.
        "should ignore settle attempts from the pre-refresh view after the remount",
        async () => {
            const { setContext } = await import("../context.js");
            const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });

            const tagName = "test-gd-insight-stale-settle";
            customElements.define(tagName, InsightElement);

            const element = document.createElement(tagName) as HTMLElement & {
                insight?: string;
                refresh: () => Promise<void>;
            };
            element.insight = "insight-id";

            document.body.append(element);

            type RefreshProps = {
                onLoadingChanged: (state: { isLoading: boolean }) => void;
                onInsightLoaded: (insight: unknown) => void;
                onError: (error: Error) => void;
            };

            const stale = (await waitForRenderProps(
                (props) => typeof props["onLoadingChanged"] === "function",
            )) as RefreshProps;
            const renderCountBeforeRefresh = renderSpy.mock.calls.length;
            const refreshPromise = element.refresh();

            let settled = false;
            void refreshPromise.then(
                () => {
                    settled = true;
                },
                () => {
                    settled = true;
                },
            );

            const remountedProps = (await waitForRenderProps(
                (props) => props !== (stale as unknown) && typeof props["onLoadingChanged"] === "function",
                { fromIndex: renderCountBeforeRefresh },
            )) as RefreshProps;

            // Every settle route the stale view still holds, fired late.
            stale.onLoadingChanged({ isLoading: false });
            stale.onInsightLoaded({});
            stale.onError(new Error("stale view failed"));
            await flushMicrotasks();

            expect(settled).toBe(false);

            // Only the remounted view can settle this refresh.
            remountedProps.onLoadingChanged({ isLoading: false });
            await expect(refreshPromise).resolves.toBeUndefined();
        },
        timeout,
    );

    it(
        // Regression test: `refresh()` used to wire `resolveRefresh`/`rejectRefresh` to the
        // new promise synchronously, then `await` the (now asynchronous) invalidation before
        // unmounting the pre-refresh view. That left a window where the still-mounted,
        // pre-refresh view could legitimately finish its own load and settle the *new*
        // refresh early, without any remount ever happening. Calling refresh() with no extra
        // flush maximizes the chance of that window being hit if the bug were still present.
        "should not let the pre-refresh view resolve refresh before the remount happens",
        async () => {
            const { setContext } = await import("../context.js");
            const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });
            autoCompleteOnMount = true;

            const tagName = "test-gd-insight-refresh-no-premature-resolve";
            customElements.define(tagName, InsightElement);

            const element = document.createElement(tagName) as HTMLElement & {
                insight?: string;
                refresh: () => Promise<void>;
            };
            element.insight = "insight-id";

            document.body.append(element);

            const initialProps = await waitForRenderProps(
                (props) => typeof props["onLoadingChanged"] === "function",
            );

            const refreshPromise = element.refresh();

            await expect(refreshPromise).resolves.toBeUndefined();

            // If refresh() resolved without a genuinely new render ever happening, the stale
            // pre-refresh view (not the refetch) must have resolved it.
            const hasRemounted = renderSpy.mock.calls.some(([props]) => props !== initialProps);
            expect(hasRemounted).toBe(true);
            expect(clearInsightViewCacheForInsightSpy).toHaveBeenCalledTimes(1);
        },
        timeout,
    );

    it(
        "should still remount without invalidating when the workspace cannot be resolved",
        async () => {
            const { setContext } = await import("../context.js");
            const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

            // A backend is set, but no workspaceId anywhere (no property, no `workspace`
            // attribute), so the workspace cannot be resolved.
            setContext({ backend: dummyBackend() });

            const tagName = "test-gd-insight-refresh-no-workspace";
            customElements.define(tagName, InsightElement);

            const element = document.createElement(tagName) as HTMLElement & {
                insight?: string;
                refresh: () => Promise<void>;
            };
            element.insight = "insight-id";

            document.body.append(element);

            const initialProps = await waitForRenderProps(
                (props) => typeof props["onLoadingChanged"] === "function",
            );
            const renderCountBeforeRefresh = renderSpy.mock.calls.length;
            const refreshPromise = element.refresh();

            const remountedProps = (await waitForRenderProps(
                (props) => props !== initialProps && typeof props["onLoadingChanged"] === "function",
                { fromIndex: renderCountBeforeRefresh },
            )) as { onLoadingChanged: (state: { isLoading: boolean }) => void };

            expect(clearInsightViewCacheForInsightSpy).not.toHaveBeenCalled();

            remountedProps.onLoadingChanged({ isLoading: false });
            await expect(refreshPromise).resolves.toBeUndefined();
        },
        timeout,
    );

    it(
        "should reject refresh when invalidation throws and leave inFlightRefresh clear",
        async () => {
            const { setContext } = await import("../context.js");
            const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });

            const tagName = "test-gd-insight-refresh-invalidate-fails";
            customElements.define(tagName, InsightElement);

            const element = document.createElement(tagName) as HTMLElement & {
                insight?: string;
                refresh: () => Promise<void>;
            };
            element.insight = "insight-id";

            document.body.append(element);

            const initialProps = await waitForRenderProps(
                (props) => typeof props["onLoadingChanged"] === "function",
            );

            const invalidationError = new Error("cache eviction failed");
            clearInsightViewCacheForInsightSpy.mockImplementationOnce(() => {
                throw invalidationError;
            });

            await expect(element.refresh()).rejects.toThrow("cache eviction failed");

            // The failed refresh must not have remounted (invalidation runs before any
            // remount) and must not have left dangling state.
            expect(renderSpy.mock.calls.at(-1)?.[0]).toBe(initialProps);

            // A subsequent refresh must still work, proving inFlightRefresh was cleared.
            const renderCountBeforeSecondRefresh = renderSpy.mock.calls.length;
            const secondRefreshPromise = element.refresh();
            const remountedProps = (await waitForRenderProps(
                (props) => props !== initialProps && typeof props["onLoadingChanged"] === "function",
                { fromIndex: renderCountBeforeSecondRefresh },
            )) as { onLoadingChanged: (state: { isLoading: boolean }) => void };
            remountedProps.onLoadingChanged({ isLoading: false });

            await expect(secondRefreshPromise).resolves.toBeUndefined();
            expect(clearInsightViewCacheForInsightSpy).toHaveBeenCalledTimes(2);
        },
        timeout,
    );

    it(
        "should emit gd-error and reject refresh when the insight reports an error",
        async () => {
            const { setContext } = await import("../context.js");
            const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });

            const tagName = "test-gd-insight-error";
            customElements.define(tagName, InsightElement);

            const element = document.createElement(tagName) as HTMLElement & {
                insight?: string;
                refresh: () => Promise<void>;
            };
            element.insight = "insight-id";

            const gdErrors: Array<{ phase: string; message: string }> = [];
            const legacyErrors: Array<{ message: string }> = [];
            element.addEventListener("gd-error", (event) => {
                gdErrors.push((event as CustomEvent<{ phase: string; message: string }>).detail);
            });
            element.addEventListener("error", (event) => {
                legacyErrors.push((event as unknown as CustomEvent<{ message: string }>).detail);
            });

            document.body.append(element);

            const initialProps = await waitForRenderProps(
                (props) => typeof props["onLoadingChanged"] === "function",
            );

            const renderCountBeforeRefresh = renderSpy.mock.calls.length;
            const refreshPromise = element.refresh();
            const remountedProps = (await waitForRenderProps(
                (props) => props !== initialProps && typeof props["onError"] === "function",
                { fromIndex: renderCountBeforeRefresh },
            )) as {
                onError: (error: Error) => void;
            };
            const error = new Error("Insight failed");

            remountedProps.onError(error);

            await expect(refreshPromise).rejects.toThrow("Insight failed");
            expect(legacyErrors.at(-1)).toMatchObject({ message: "Insight failed" });
            expect(gdErrors.at(-1)).toMatchObject({
                phase: "update",
                message: "Insight failed",
            });
        },
        timeout,
    );
});
