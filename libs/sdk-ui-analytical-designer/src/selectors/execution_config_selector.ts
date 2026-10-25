// (C) 2021-2026 GoodData Corporation

import { type IExecutionConfig, sanitizeParameterValue } from "@gooddata/sdk-model";

import { parametersToMetadata } from "../models/metadata.js";
import { getParameterFilters } from "../store/filter_bar/filter_bar_selector.js";
import { type IAppState } from "../store/types.js";

import { getDataSamplingPercentage } from "./data_sampling_selector.js";
import { isDataSamplingEnabled } from "./feature_flag_selector.js";
import { getRouteQueryAsOfDate } from "./route_selector.js";
import { getEffectiveTimezone } from "./timezone_override_selectors.js";

export const getExecutionConfig = (state: IAppState): IExecutionConfig => {
    // if the data sampling is not enabled do not set it in the execution config
    // this can happen when the user enables the sampling on a workspace that has it
    // and then switches to a workspace that does not -> in that case ignore the setting
    // since this is stored in localStorage, it is carried over between workspaces...
    const dataSamplingProp = isDataSamplingEnabled(state)
        ? {
              dataSamplingPercentage: getDataSamplingPercentage(state),
          }
        : {};

    const executionTimestamp = getRouteQueryAsOfDate(state);
    const timestampObj = executionTimestamp ? { timestamp: executionTimestamp } : {};

    // session-only ad-hoc override; when unset the backend applies the workspace default
    const effectiveTimezone = getEffectiveTimezone(state);
    const timezoneProp = effectiveTimezone ? { timezone: effectiveTimezone } : {};

    const parameterValues = parametersToMetadata(
        getParameterFilters(state).map((filter) => ({
            ...filter,
            value: sanitizeParameterValue(filter.definition, filter.value),
        })),
    );
    const parameterValuesProp = parameterValues.length > 0 ? { parameterValues } : {};

    return {
        ...dataSamplingProp,
        ...timestampObj,
        ...timezoneProp,
        ...parameterValuesProp,
    };
};
