// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { prepareExecution } from "@gooddata/sdk-backend-spi";
import { emptyDef } from "@gooddata/sdk-model";

import { BaseChart } from "../../_base/BaseChart.js";
import { CoreAreaChart } from "../CoreAreaChart.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../../_base/BaseChart", () => ({
    BaseChart: vi.fn(() => null),
}));

/**
 * The suite runs without test isolation (see `isolate: false` in vitest.config.ts), so the module
 * registry is shared by every test file executed in the same worker. Sibling files that pull in the
 * real AreaChart component tree (AreaChartStacking.test.ts imports ../AreaChart.js, which imports
 * CoreAreaChart) may therefore have already evaluated and cached CoreAreaChart with the *real*
 * BaseChart bound into it - the mock above would then never be reached and the assertions below
 * would fail depending on the file ordering picked by the runner.
 *
 * Dropping the module cache before this file's own imports are evaluated (vi.hoisted runs ahead of
 * them, unlike a plain top-level statement) guarantees CoreAreaChart is re-evaluated against the
 * mock. Modules from node_modules are kept, so React and testing-library instances stay shared.
 */
vi.hoisted(() => {
    vi.resetModules();
});

describe("CoreAreaChart", () => {
    it("should render BaseChart", () => {
        render(<CoreAreaChart execution={prepareExecution(dummyBackend(), emptyDef("testWorkspace"))} />);
        expect(BaseChart).toHaveBeenCalled();
    });
});
