// (C) 2020-2025 GoodData Corporation
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IInsight, ObjRef, idRef } from "@gooddata/sdk-model";

import { noopWorkspaceInsightsService } from "./dataLoaders.mock.js";
import { insightDataLoaderFactory } from "../InsightDataLoader.js";

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
});
