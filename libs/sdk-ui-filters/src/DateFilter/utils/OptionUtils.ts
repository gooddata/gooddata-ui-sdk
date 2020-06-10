// (C) 2019-2020 GoodData Corporation
import { DateFilterOption } from "../interfaces";
import {
    DateFilterGranularity,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
} from "@gooddata/sdk-backend-spi";

export function getDateFilterOptionGranularity(dateFilterOption: DateFilterOption): DateFilterGranularity {
    return isRelativeDateFilterForm(dateFilterOption) || isRelativeDateFilterPreset(dateFilterOption)
        ? dateFilterOption.granularity
        : undefined;
}
