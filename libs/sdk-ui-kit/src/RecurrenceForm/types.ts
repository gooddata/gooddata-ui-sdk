// (C) 2024 GoodData Corporation

import { RECURRENCE_TYPES } from "./constants.js";

/**
 * @internal
 */
export type RecurrenceType = typeof RECURRENCE_TYPES[keyof typeof RECURRENCE_TYPES];
