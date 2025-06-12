// (C) 2007-2021 GoodData Corporation
import { DateFilterOption, isUiRelativeDateFilterForm } from "../interfaces/index.js";

export function normalizeSelectedFilterOption(selectedFilterOption: DateFilterOption): DateFilterOption {
    if (
        isUiRelativeDateFilterForm(selectedFilterOption) &&
        selectedFilterOption.from > selectedFilterOption.to
    ) {
        return {
            ...selectedFilterOption,
            from: selectedFilterOption.to,
            to: selectedFilterOption.from,
        };
    }
    return selectedFilterOption;
}
