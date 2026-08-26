// (C) 2026 GoodData Corporation

import { RangePicker, type RangePickerProps } from "@rc-component/picker";
import * as momentGenerateConfigModule from "@rc-component/picker/generate/moment";
import { defaultImport } from "default-import";
import { type Moment } from "moment";

// `@rc-component/picker`'s "es" build ships ESM `export default` syntax without a nested `package.json`
// marking that directory `"type": "module"`, which defeats NodeNext module resolution's default-import typing
// for this dependency. `defaultImport` unwraps the default export under both interop shapes this module is
// loaded through (real ESM namespace when bundlers inline it, CJS interop when vitest externalizes it).
type MomentGenerateConfig = RangePickerProps<Moment>["generateConfig"];
const momentGenerateConfig = defaultImport(
    momentGenerateConfigModule as unknown as { default: MomentGenerateConfig },
);

/**
 * rc-picker's RangePicker with `generateConfig` pre-bound to run on `moment`, so it composes directly
 * with this package's existing moment-based date handling without introducing a second date library.
 */
export type MomentRangePickerProps = Omit<RangePickerProps<Moment>, "generateConfig">;

export function MomentRangePicker(props: MomentRangePickerProps) {
    return <RangePicker<Moment> generateConfig={momentGenerateConfig} {...props} />;
}
