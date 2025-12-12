// (C) 2019-2025 GoodData Corporation
import { type IAbsoluteDateFilterPreset, type IRelativeDateFilterPreset } from "@gooddata/sdk-model";
import { type AbsoluteDateFilterOption, type RelativeDateFilterOption } from "@gooddata/sdk-ui-filters";

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
