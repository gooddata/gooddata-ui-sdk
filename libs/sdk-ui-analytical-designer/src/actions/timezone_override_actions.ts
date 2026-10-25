// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../constants/actions.js";

/**
 * Sets or clears the session-only ad-hoc timezone override used for insight executions. The payload
 * is a concrete IANA timezone ID, or undefined to clear the override and restore the
 * workspace/organization default. The value is never written to the Insight object.
 */
export const setTimezoneOverride = createAction(
    ActionTypeKeys.SET_TIMEZONE_OVERRIDE,
    (timezoneId: string | undefined) => ({ payload: timezoneId }),
);
