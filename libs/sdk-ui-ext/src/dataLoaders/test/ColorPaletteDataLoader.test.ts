// (C) 2020-2021 GoodData Corporation
import noop from "lodash/noop.js";
import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IColorPalette } from "@gooddata/sdk-model";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { colorPaletteDataLoaderFactory } from "../ColorPaletteDataLoader.js";

describe("ColorPaletteDataLoader", () => {
    const workspace = "foo";
    const baseBackend = dummyBackendEmptyData();

    const getMockBackend = (getColorPalette: () => Promise<IColorPalette>): IAnalyticalBackend => ({
        ...baseBackend,
        workspace: () => ({
            ...baseBackend.workspace(workspace),
            styling: () => ({
                getColorPalette,
                getTheme: noop as any,
            }),
        }),
    });

    beforeEach(() => {
        colorPaletteDataLoaderFactory.reset();
    });

    it("should cache getColorPalette calls", async () => {
        const loader = colorPaletteDataLoaderFactory.forWorkspace(workspace);
        const getColorPalette = vi.fn(() => Promise.resolve({} as any));
        const backend = getMockBackend(getColorPalette);

        const first = loader.getColorPalette(backend);
        const second = loader.getColorPalette(backend);

        const [firstResult, secondResult] = await Promise.all([first, second]);

        expect(secondResult).toBe(firstResult);
        expect(getColorPalette).toHaveBeenCalledTimes(1);
    });

    it("should not cache getColorPalette errors", async () => {
        const loader = colorPaletteDataLoaderFactory.forWorkspace(workspace);
        const getColorPalette = vi.fn(() => Promise.resolve({} as any));
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
