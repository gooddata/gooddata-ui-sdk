// (C) 2022-2026 GoodData Corporation

import { type IAllTimeDateFilterOption } from "@gooddata/sdk-model";
import {
    DateFilterHelpers,
    type IUiAbsoluteDateFilterForm,
    type IUiRelativeDateFilterForm,
} from "@gooddata/sdk-ui-filters";

export const ALL_TIME_FILTER_OPTION: IAllTimeDateFilterOption =
    DateFilterHelpers.defaultDateFilterOptions.allTime;

export const STATIC_PERIOD_FILTER_OPTION: IUiAbsoluteDateFilterForm =
    DateFilterHelpers.defaultDateFilterOptions.absoluteForm;

export const RELATIVE_PERIOD_FILTER_OPTION: IUiRelativeDateFilterForm = {
    ...DateFilterHelpers.defaultDateFilterOptions.relativeForm,
    granularity: "GDC.time.month",
};
