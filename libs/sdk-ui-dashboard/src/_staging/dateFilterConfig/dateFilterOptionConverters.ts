// (C) 2021-2022 GoodData Corporation
import {
    DateFilterOption,
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
} from "@gooddata/sdk-ui-filters";
import { isAllTimeDateFilterOption, IDashboardDateFilter } from "@gooddata/sdk-model";
import { InvariantError } from "ts-invariant";

export function convertOptionToDateFilter(option: DateFilterOption): IDashboardDateFilter | undefined {
    if (isAllTimeDateFilterOption(option)) {
        return;
    }

    if (isAbsoluteDateFilterOption(option)) {
        return {
            dateFilter: {
                type: "absolute",
                granularity: "GDC.time.date",
                from: option.from,
                to: option.to,
            },
        };
    } else if (isRelativeDateFilterOption(option)) {
        return {
            dateFilter: {
                type: "relative",
                granularity: option.granularity ?? "GDC.time.date",
                from: option.from,
                to: option.to,
            },
        };
    }

    throw new InvariantError("Unexpected option type when converting date filter option to filter.");
}
