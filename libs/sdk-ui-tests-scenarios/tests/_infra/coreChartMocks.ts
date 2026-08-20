// (C) 2026 GoodData Corporation

import { withScopedPropsExtractor } from "./withProps.js";

/**
 * The single props extractor behind every `Core*` chart mock registered in `vitest.setup.ts`.
 *
 * Registering those mocks once, globally, is what lets the chart api-regression suites drop their per-file
 * `vi.resetModules()`: the `@gooddata/sdk-ui-charts` barrel then only ever binds to mocked cores, so no test
 * file can cache a wrapper bound to a real one.
 *
 * One instance is safe to share across all files and all charts: `captureProps` activates a dedicated slot
 * synchronously around each mount and hands that mount an extractor closed over its own slot, so concurrent
 * mounts cannot clobber each other's props.
 */
export const scopedCoreChartExtractor = withScopedPropsExtractor();

export const captureProps = scopedCoreChartExtractor.captureProps;
