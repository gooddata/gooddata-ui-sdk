// (C) 2024 GoodData Corporation

import { RECURRENCE_TYPES } from "./constants.js";

type RecurrenceTypeKey = keyof typeof RECURRENCE_TYPES;

export type RecurrenceType = typeof RECURRENCE_TYPES[RecurrenceTypeKey];
