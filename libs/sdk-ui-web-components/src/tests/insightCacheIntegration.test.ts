// (C) 2026 GoodData Corporation

// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IInsight, type ObjRef, idRef } from "@gooddata/sdk-model";
import { clearInsightViewCaches } from "@gooddata/sdk-ui-ext";

/*
 * Proves the composition that the other suites cannot: that the cache entry `refresh()` evicts is
 * the same entry `InsightView` reads through. `insight.test.ts` stubs `@gooddata/sdk-ui-ext`
 * wholesale, so it can only show that `clearInsightViewCacheForInsight` was called with the right
 * arguments; and `sdk-ui-ext`'s own tests exercise the loader without the element wiring.
 *
 * Nothing is mocked here. The real `InsightView` mounts, performs its real read through the real
 * module-scoped loader cache, and the assertions are simply how many times the backend was asked
 * for the insight. That keeps this test free of any reach into `sdk-ui-ext`'s internals - the cache
 * is observed through public API and real behaviour rather than by importing the loader factory.
 *
 * The visualization itself cannot render under happy-dom (there is no chart-capable environment),
 * so the element emits `gd-error` and `refresh()` may settle either way. Neither is asserted on:
 * this test is about the data path, so it deliberately tolerates a failed render.
 */

const workspace = "workspace";
const insightId = "insight-id";
const ref: ObjRef = idRef(insightId, "insight");

const buildInsight = (): IInsight =>
    ({
        insight: {
            identifier: insightId,
            uri: `/insights/${insightId}`,
            ref,
            title: "cache integration insight",
            visualizationUrl: "local:column",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
        },
    }) as unknown as IInsight;

const buildCountingBackend = (getInsight: (ref: ObjRef) => Promise<IInsight>): IAnalyticalBackend => {
    const base = dummyBackend();
    return {
        ...base,
        workspace: (id: string) => ({
            ...base.workspace(id),
            insights: () => ({
                ...base.workspace(id).insights(),
                getInsight,
            }),
        }),
    } as IAnalyticalBackend;
};

const waitUntil = async (predicate: () => boolean, what: string, timeoutMs = 15000) => {
    const deadline = Date.now() + timeoutMs;
    while (!predicate()) {
        if (Date.now() >= deadline) {
            throw new Error(`Timed out after ${timeoutMs}ms waiting for ${what}`);
        }
        await new Promise((resolve) => {
            setTimeout(resolve, 25);
        });
    }
};

describe("InsightEmbed cache integration (real sdk-ui-ext cache)", () => {
    beforeEach(() => {
        // Public API, and the same reset the docs point hosts at - so this suite needs no access
        // to the internal loader factory in order to isolate itself.
        clearInsightViewCaches();
        document.body.innerHTML = "";
    });

    it("should evict the cache entry InsightView reads, so refresh() refetches the insight", async () => {
        const { setContext } = await import("../context.js");
        const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

        const getInsight = vi.fn(() => Promise.resolve(buildInsight()));
        setContext({ backend: buildCountingBackend(getInsight), workspaceId: workspace });

        const tagName = "test-gd-insight-cache-integration";
        customElements.define(tagName, InsightElement);
        const element = document.createElement(tagName) as HTMLElement & {
            insight?: string;
            refresh: () => Promise<void>;
        };
        element.insight = insightId;

        document.body.append(element);

        // The real InsightView resolves the insight through the real loader, populating the
        // module-scoped cache.
        await waitUntil(() => getInsight.mock.calls.length > 0, "the first insight fetch");
        expect(getInsight).toHaveBeenCalledTimes(1);

        // Tolerates rejection: the render fails in this environment, which is not what we are
        // testing.
        await element.refresh().catch(() => undefined);

        // Only an eviction of that entry can make the remounted InsightView hit the backend
        // again; without one it would re-read the identical cached promise, which is exactly
        // the customer-facing bug (EB-895).
        await waitUntil(() => getInsight.mock.calls.length > 1, "the post-refresh insight refetch");
        expect(getInsight).toHaveBeenCalledTimes(2);
        // Comfortably above the two 15s polling budgets plus mount and scheduler time, so a real
        // failure surfaces waitUntil's message naming which wait gave up, rather than Vitest's
        // generic timeout.
    }, 40000);
});
