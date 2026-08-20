// (C) 2023-2026 GoodData Corporation

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("mapbox-gl", () => ({}));

/*
 * The chart api-regression suites assert on the props a top-level chart hands down to its core chart, which
 * they observe by mocking the core with a props-extracting wrapper.
 *
 * Those mocks are registered here rather than per test file on purpose. The suite runs with `isolate: false`,
 * so a single module registry is shared by every test file; importing the `@gooddata/sdk-ui-charts` barrel
 * evaluates every chart wrapper and caches it, and `vi.mock` cannot retroactively rebind a wrapper that is
 * already bound to a real core. A file registering its own core mock therefore had to drop the whole registry
 * first - re-importing the full graph once per file - to be independent of the order vitest schedules files
 * in. Setup files run before any test file's imports are evaluated, so registering the mocks here means the
 * barrel only ever resolves to mocked cores and no `vi.resetModules()` is needed anywhere.
 *
 * All of them share one props extractor (see `tests/_infra/coreChartMocks.ts`); it is pulled in with a
 * dynamic import from inside the factories, which sidesteps the `vi.mock` hoisting restriction.
 *
 * `mockedCoreChart` is a function declaration on purpose: vitest hoists the `vi.mock` calls above it, so a
 * `const` would still be in its temporal dead zone when a factory runs.
 */
async function mockedCoreChart(name: string, Original: Record<string, any>) {
    const { scopedCoreChartExtractor } = await import("./tests/_infra/coreChartMocks.js");

    return { ...Original, [name]: scopedCoreChartExtractor.wrap(Original[name]) };
}

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreAreaChart", async () =>
    mockedCoreChart(
        "CoreAreaChart",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreAreaChart"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreBarChart", async () =>
    mockedCoreChart(
        "CoreBarChart",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreBarChart"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreBubbleChart", async () =>
    mockedCoreChart(
        "CoreBubbleChart",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreBubbleChart"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreBulletChart", async () =>
    mockedCoreChart(
        "CoreBulletChart",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreBulletChart"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreColumnChart", async () =>
    mockedCoreChart(
        "CoreColumnChart",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreColumnChart"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreComboChart", async () =>
    mockedCoreChart(
        "CoreComboChart",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreComboChart"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreDependencyWheelChart", async () =>
    mockedCoreChart(
        "CoreDependencyWheelChart",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreDependencyWheelChart"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreDonutChart", async () =>
    mockedCoreChart(
        "CoreDonutChart",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreDonutChart"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreFunnelChart", async () =>
    mockedCoreChart(
        "CoreFunnelChart",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreFunnelChart"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreHeadline", async () =>
    mockedCoreChart(
        "CoreHeadline",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreHeadline"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreHeatmap", async () =>
    mockedCoreChart(
        "CoreHeatmap",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreHeatmap"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreLineChart", async () =>
    mockedCoreChart(
        "CoreLineChart",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreLineChart"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CorePieChart", async () =>
    mockedCoreChart(
        "CorePieChart",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CorePieChart"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreRepeater", async () =>
    mockedCoreChart(
        "CoreRepeater",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreRepeater"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreSankeyChart", async () =>
    mockedCoreChart(
        "CoreSankeyChart",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreSankeyChart"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreScatterPlot", async () =>
    mockedCoreChart(
        "CoreScatterPlot",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreScatterPlot"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreTreemap", async () =>
    mockedCoreChart(
        "CoreTreemap",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreTreemap"),
    ),
);

vi.mock("@gooddata/sdk-ui-charts/internal-tests/CoreXirr", async () =>
    mockedCoreChart(
        "CoreXirr",
        await vi.importActual<any>("@gooddata/sdk-ui-charts/internal-tests/CoreXirr"),
    ),
);

// Mock CSS.supports for jsdom environment
if (typeof globalThis.CSS === "undefined") {
    (globalThis as any).CSS = {
        supports: () => false,
    };
} else if (!globalThis.CSS.supports) {
    globalThis.CSS.supports = () => false;
}

afterEach(() => {
    cleanup();
});
