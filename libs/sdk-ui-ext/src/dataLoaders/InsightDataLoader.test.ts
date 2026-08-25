// (C) 2020-2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IInsight, type ObjRef, idRef } from "@gooddata/sdk-model";

import { noopWorkspaceInsightsService } from "./dataLoaders.mock.js";
import { clearInsightViewCacheForInsight } from "./index.js";
import { insightDataLoaderFactory } from "./InsightDataLoader.js";

describe("InsightDataLoader", () => {
    const workspace = "foo";
    const baseBackend = dummyBackendEmptyData();

    const getMockBackend = (getInsight: (ref: ObjRef) => Promise<IInsight>): IAnalyticalBackend => ({
        ...baseBackend,
        workspace: () => ({
            ...baseBackend.workspace(workspace),
            insights: () => ({
                ...noopWorkspaceInsightsService,
                getInsight,
            }),
        }),
    });

    beforeEach(() => {
        insightDataLoaderFactory.reset();
    });

    it("should cache getInsight calls", async () => {
        const loader = insightDataLoaderFactory.forWorkspace(workspace);
        const getInsight = vi.fn(() => Promise.resolve({} as any));
        const backend = getMockBackend(getInsight);

        const ref = idRef("foo");

        const first = loader.getInsight(backend, ref);
        const second = loader.getInsight(backend, ref);

        const [firstResult, secondResult] = await Promise.all([first, second]);

        expect(secondResult).toBe(firstResult);
        expect(getInsight).toHaveBeenCalledTimes(1);
    });

    it("should not cache getInsight errors", async () => {
        const loader = insightDataLoaderFactory.forWorkspace(workspace);
        const getInsight = vi.fn(() => Promise.resolve({} as any));
        const errorBackend = getMockBackend(() => {
            throw new Error("FAIL");
        });
        const successBackend = getMockBackend(getInsight);

        const ref = idRef("foo");

        try {
            await loader.getInsight(errorBackend, ref);
        } catch {
            // do nothing
        }

        await loader.getInsight(successBackend, ref);

        expect(getInsight).toHaveBeenCalledTimes(1);
    });

    it("should refetch the insight after invalidateInsight", async () => {
        const loader = insightDataLoaderFactory.forWorkspace(workspace);
        const getInsight = vi.fn(() => Promise.resolve({} as any));
        const backend = getMockBackend(getInsight);

        const ref = idRef("foo");

        await loader.getInsight(backend, ref);
        // Invalidate with a freshly constructed, structurally-equal ref (not the same
        // instance as `ref`) so this test would fail if the cache keyed on ObjRef identity
        // instead of its derived string.
        loader.invalidateInsight(idRef("foo"));
        await loader.getInsight(backend, ref);

        expect(getInsight).toHaveBeenCalledTimes(2);
    });

    it("should only invalidate the specified insight, leaving other cached insights intact", async () => {
        const loader = insightDataLoaderFactory.forWorkspace(workspace);
        const getInsight = vi.fn(() => Promise.resolve({} as any));
        const backend = getMockBackend(getInsight);

        const fooRef = idRef("foo");
        const barRef = idRef("bar");

        await loader.getInsight(backend, fooRef);
        const barFirst = loader.getInsight(backend, barRef);
        await barFirst;

        loader.invalidateInsight(fooRef);

        await loader.getInsight(backend, fooRef);
        const barSecond = loader.getInsight(backend, barRef);
        await barSecond;

        expect(getInsight).toHaveBeenCalledTimes(3);
        expect(barSecond).toBe(barFirst);
    });

    it("should evict an entry populated the way InsightView populates it", async () => {
        // This guards the cross-package key agreement between `InsightView` (this package)
        // and `InsightEmbed.refresh()` (`sdk-ui-web-components`), which is otherwise only
        // enforced by code inspection: `InsightView.tsx:107` derives its ref via
        // `typeof insight === "string" ? idRef(insight, "insight") : insight`, and
        // `InsightEmbed.refresh()` derives the ref it evicts via the exact same expression.
        // Neither side imports the other's derivation, so if one of them drifted (e.g. someone
        // "simplified" one of the two `idRef` calls) this test - not a customer bug report -
        // should be what catches it. Do not delete this as a duplicate of the
        // "should refetch the insight after invalidateInsight" test above: that test only
        // proves the loader's own `invalidateInsight` works, not that it agrees with how the
        // two real call sites populate/evict it.
        const loader = insightDataLoaderFactory.forWorkspace(workspace);
        const getInsight = vi.fn(() => Promise.resolve({} as any));
        const backend = getMockBackend(getInsight);

        const id = "foo";

        // Populate exactly as `InsightView.tsx:107` does for a string `insight` prop.
        await loader.getInsight(backend, idRef(id, "insight"));

        // Evict exactly as `InsightEmbed.refresh()`'s `invalidateCachedInsight()` does.
        clearInsightViewCacheForInsight(workspace, idRef(id, "insight"));

        await loader.getInsight(backend, idRef(id, "insight"));

        expect(getInsight).toHaveBeenCalledTimes(2);
    });

    it("should evict regardless of whether the populating or evicting ref carries a type", async () => {
        // `objRefToString` (which both `InsightDataLoader.getInsight` and `invalidateInsight`
        // key on) drops the `type` field for identifier refs entirely - `idRef(id)` and
        // `idRef(id, "insight")` serialize identically. Both real call sites happen to always
        // pass a typed ref today, but nothing enforces that they stay in sync on this point.
        // This pins the current `objRefToString` behaviour so that a future change which made
        // type-presence key-significant (splitting `idRef(id)` and `idRef(id, "insight")` into
        // different cache slots) would fail here, in a test that names the invariant, instead
        // of resurfacing as the customer's stale-insight bug in production.
        const loader = insightDataLoaderFactory.forWorkspace(workspace);

        const untypedGetInsight = vi.fn(() => Promise.resolve({} as any));
        const untypedBackend = getMockBackend(untypedGetInsight);
        const untypedId = "untyped-foo";

        await loader.getInsight(untypedBackend, idRef(untypedId));
        loader.invalidateInsight(idRef(untypedId, "insight"));
        await loader.getInsight(untypedBackend, idRef(untypedId));

        expect(untypedGetInsight).toHaveBeenCalledTimes(2);

        const typedGetInsight = vi.fn(() => Promise.resolve({} as any));
        const typedBackend = getMockBackend(typedGetInsight);
        const typedId = "typed-foo";

        await loader.getInsight(typedBackend, idRef(typedId, "insight"));
        loader.invalidateInsight(idRef(typedId));
        await loader.getInsight(typedBackend, idRef(typedId, "insight"));

        expect(typedGetInsight).toHaveBeenCalledTimes(2);
    });

    it("clearInsightViewCacheForInsight should only invalidate the given workspace", async () => {
        const ref = idRef("foo");
        const fooGetInsight = vi.fn(() => Promise.resolve({} as any));
        const barGetInsight = vi.fn(() => Promise.resolve({} as any));

        const fooLoader = insightDataLoaderFactory.forWorkspace("foo");
        const barLoader = insightDataLoaderFactory.forWorkspace("bar");

        await fooLoader.getInsight(getMockBackend(fooGetInsight), ref);
        await barLoader.getInsight(getMockBackend(barGetInsight), ref);

        // Same rationale as above: use a fresh `ObjRef` instance here, not `ref`.
        clearInsightViewCacheForInsight("foo", idRef("foo"));

        await fooLoader.getInsight(getMockBackend(fooGetInsight), ref);
        await barLoader.getInsight(getMockBackend(barGetInsight), ref);

        expect(fooGetInsight).toHaveBeenCalledTimes(2);
        expect(barGetInsight).toHaveBeenCalledTimes(1);
    });
});
