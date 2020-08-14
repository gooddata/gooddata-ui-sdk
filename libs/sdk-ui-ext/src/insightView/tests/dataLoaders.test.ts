// (C) 2020 GoodData Corporation
import noop from "lodash/noop";
import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend, IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { idRef, IColorPalette, ObjRef, IInsight } from "@gooddata/sdk-model";

import { getInsightViewDataLoader, clearInsightViewCaches, InsightViewDataLoader } from "../dataLoaders";

describe("getInsightViewDataLoader", () => {
    const workspace = "foo";

    beforeEach(() => {
        clearInsightViewCaches();
    });

    it("should return the same instance of loader for the same workspace", () => {
        const first = getInsightViewDataLoader(workspace);
        const second = getInsightViewDataLoader(workspace);

        expect(second).toBe(first);
    });

    it("should return different instances of loader for different workspaces", () => {
        const first = getInsightViewDataLoader("foo");
        const second = getInsightViewDataLoader("bar");

        expect(second).not.toBe(first);
    });

    it("should return different instance of loader for the same workspace if the cache has been cleared", () => {
        const first = getInsightViewDataLoader(workspace);

        clearInsightViewCaches();

        const second = getInsightViewDataLoader(workspace);

        expect(second).not.toBe(first);
    });
});

describe("InsightViewDataLoader", () => {
    const workspace = "foo";
    const baseBackend = dummyBackendEmptyData();

    describe("colorPalette calls", () => {
        const getMockBackend = (getColorPalette: () => Promise<IColorPalette>): IAnalyticalBackend => ({
            ...baseBackend,
            workspace: () => ({
                ...baseBackend.workspace(workspace),
                styling: () => ({
                    colorPalette: getColorPalette,
                }),
            }),
        });

        it("should cache colorPalette calls", async () => {
            const loader = new InsightViewDataLoader(workspace);
            const getColorPalette = jest.fn(() => Promise.resolve([]));
            const backend = getMockBackend(getColorPalette);

            const first = loader.getColorPalette(backend);
            const second = loader.getColorPalette(backend);

            const [firstResult, secondResult] = await Promise.all([first, second]);

            expect(secondResult).toBe(firstResult);
            expect(getColorPalette).toHaveBeenCalledTimes(1);
        });

        it("should not cache colorPalette errors", async () => {
            const loader = new InsightViewDataLoader(workspace);
            const getColorPalette = jest.fn(() => Promise.resolve([]));
            const errorBackend = getMockBackend(() => {
                throw new Error("FAIL");
            });
            const successBackend = getMockBackend(getColorPalette);

            try {
                await loader.getColorPalette(errorBackend);
            } catch {
                // do nothing
            }

            await loader.getColorPalette(successBackend);

            expect(getColorPalette).toHaveBeenCalledTimes(1);
        });
    });

    describe("workspaceSettings calls", () => {
        const getMockBackend = (getSettings: () => Promise<IWorkspaceSettings>): IAnalyticalBackend => ({
            ...baseBackend,
            workspace: () => ({
                ...baseBackend.workspace(workspace),
                settings: () => ({
                    queryForCurrentUser: noop as any,
                    query: getSettings,
                }),
            }),
        });

        it("should cache workspaceSettings calls", async () => {
            const loader = new InsightViewDataLoader(workspace);
            const getSettings = jest.fn(() => Promise.resolve({ workspace }));
            const backend = getMockBackend(getSettings);

            const first = loader.getWorkspaceSettings(backend);
            const second = loader.getWorkspaceSettings(backend);

            const [firstResult, secondResult] = await Promise.all([first, second]);

            expect(secondResult).toBe(firstResult);
            expect(getSettings).toHaveBeenCalledTimes(1);
        });

        it("should not cache workspaceSettings errors", async () => {
            const loader = new InsightViewDataLoader(workspace);
            const getSettings = jest.fn(() => Promise.resolve({ workspace }));
            const errorBackend = getMockBackend(() => {
                throw new Error("FAIL");
            });
            const successBackend = getMockBackend(getSettings);

            try {
                await loader.getWorkspaceSettings(errorBackend);
            } catch {
                // do nothing
            }

            await loader.getWorkspaceSettings(successBackend);

            expect(getSettings).toHaveBeenCalledTimes(1);
        });
    });

    describe("insight calls", () => {
        const getMockBackend = (getInsight: (ref: ObjRef) => Promise<IInsight>): IAnalyticalBackend => ({
            ...baseBackend,
            workspace: () => ({
                ...baseBackend.workspace(workspace),
                insights: () => ({
                    createInsight: noop as any,
                    deleteInsight: noop as any,
                    getInsight,
                    getInsights: noop as any,
                    getReferencedObjects: noop as any,
                    getVisualizationClass: noop as any,
                    getVisualizationClasses: noop as any,
                    updateInsight: noop as any,
                    getObjectsReferencing: noop as any,
                }),
            }),
        });

        it("should cache insight calls", async () => {
            const loader = new InsightViewDataLoader(workspace);
            const getInsight = jest.fn(() => Promise.resolve({} as any));
            const backend = getMockBackend(getInsight);

            const ref = idRef("foo");

            const first = loader.getInsight(backend, ref);
            const second = loader.getInsight(backend, ref);

            const [firstResult, secondResult] = await Promise.all([first, second]);

            expect(secondResult).toBe(firstResult);
            expect(getInsight).toHaveBeenCalledTimes(1);
        });

        it("should not cache insight errors", async () => {
            const loader = new InsightViewDataLoader(workspace);
            const getInsight = jest.fn(() => Promise.resolve({} as any));
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
});
