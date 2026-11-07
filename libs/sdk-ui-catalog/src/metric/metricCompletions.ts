// (C) 2026 GoodData Corporation

import { createFlatKeyCompletions } from "../asCode/keyCompletions.js";

import { METRIC_SCHEMA_KEYS } from "./metricSchema.js";

export const metricCompletions = createFlatKeyCompletions(METRIC_SCHEMA_KEYS[""]?.keys ?? []);
