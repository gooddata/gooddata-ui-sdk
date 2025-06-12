// (C) 2024 GoodData Corporation

import { RECURRENCE_TYPES } from "./constants.js";

/**
 * Represents a recurrence type key.
 * @internal
 */
export type RecurrenceTypeKey = keyof typeof RECURRENCE_TYPES;

/**
 * Represents a recurrence type.
 * @internal
 */
export type RecurrenceType = typeof RECURRENCE_TYPES[RecurrenceTypeKey];
