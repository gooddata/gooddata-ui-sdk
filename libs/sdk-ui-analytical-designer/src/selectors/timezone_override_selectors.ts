// (C) 2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IAppState } from "../store/types.js";

import { isEnableTimezoneChange } from "./feature_flag_selector.js";

/**
 * Session-only ad-hoc timezone override (concrete IANA ID), or undefined when none is set.
 * The slice stores `null` for "not set"; this boundary converts back to undefined
 * so the readers' default-parameter/spread idioms keep working.
 */
export const getTimezoneOverride = (state: IAppState): string | undefined =>
    (state.timezoneOverride as string | null | undefined) ?? undefined;

/**
 * Effective timezone for AD insight executions: the session override when the feature is
 * enabled and an override is set; otherwise undefined so the backend applies the workspace
 * default (no timezone stamped onto executionConfig).
 */
export const getEffectiveTimezone = createSelector(
    isEnableTimezoneChange,
    getTimezoneOverride,
    (isEnabled, timezoneOverride): string | undefined => {
        if (!isEnabled || !timezoneOverride) {
            return undefined;
        }
        return timezoneOverride;
    },
);
