// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// `isolate: false` shares one module graph per worker; drop it so the imports below resolve through the mocks.
const { run } = vi.hoisted(() => {
    vi.resetModules();
    return { run: vi.fn() };
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn(() => ({})),
}));

vi.mock("../../../model/react/useDashboardCommandProcessing.js", () => ({
    useDashboardCommandProcessing: vi.fn(() => ({ run })),
}));

import { useSaveAs } from "./useSaveAs.js";

describe("useSaveAs", () => {
    it("should run the save as command with a title cut to 255 characters", () => {
        const { result } = renderHook(() => useSaveAs({}));

        result.current.handleSaveAs("a".repeat(256), true);

        expect(run).toHaveBeenCalledWith("a".repeat(255), true, true);
    });
});
