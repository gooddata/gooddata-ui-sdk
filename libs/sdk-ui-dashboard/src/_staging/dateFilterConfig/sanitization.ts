// (C) 2019-2025 GoodData Corporation
import { IAbsoluteDateFilterPreset, IRelativeDateFilterPreset } from "@gooddata/sdk-model";
import { AbsoluteDateFilterOption, RelativeDateFilterOption } from "@gooddata/sdk-ui-filters";

const max = <T>(a: T, b: T): T => (a > b ? a : b);
const min = <T>(a: T, b: T): T => (a <= b ? a : b);

export const sanitizeDateFilterOption = <
    T extends
        | RelativeDateFilterOption
        | AbsoluteDateFilterOption
        | IAbsoluteDateFilterPreset
        | IRelativeDateFilterPreset,
>(
    option: T,
): T => ({
    ...option,
    from: min(option.from, option.to),
    to: max(option.from, option.to),
});
