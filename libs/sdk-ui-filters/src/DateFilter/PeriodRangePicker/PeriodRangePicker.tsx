// (C) 2026 GoodData Corporation

import { Suspense, lazy } from "react";

import { type IPeriodRangePickerProps } from "./types.js";

// `@rc-component/picker`'s "es" build - the one its package.json `exports` map serves to the `import`
// condition, for every subpath - ships ESM syntax with extensionless relative imports (`from "./common"`),
// which Node's ESM resolver cannot resolve. It is therefore loadable by bundlers only: under plain Node ESM
// every entry point of that package throws ERR_MODULE_NOT_FOUND. Since this package is `"type": "module"`,
// Node always takes that `import` condition, so anything that statically reaches rc-picker poisons the whole
// `@gooddata/sdk-ui-filters` barrel for Node consumers - including every other package's vitest run, where
// this package's built `esm/` is externalized and resolved by Node rather than by Vite.
//
// Keeping the rc-picker-importing module behind a dynamic import keeps the barrel importable in Node and
// code-splits a heavy dependency out of the main bundle; the picker is only ever shown on demand anyway.
const PeriodRangePickerImpl = lazy(async () => ({
    default: (await import("./PeriodRangePickerImpl.js")).PeriodRangePickerImpl,
}));

/**
 * A grid picker for selecting a Week/Month/Quarter/Year period range. Renders the rc-picker panel matching
 * {@link IPeriodRangePickerProps.granularity} and reports the resolved day-level range via `onRangeChange`.
 *
 * @alpha
 */
export function PeriodRangePicker(props: IPeriodRangePickerProps) {
    return (
        <Suspense fallback={null}>
            <PeriodRangePickerImpl {...props} />
        </Suspense>
    );
}
