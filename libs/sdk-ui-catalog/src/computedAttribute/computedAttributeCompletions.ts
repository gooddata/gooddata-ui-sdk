// (C) 2026 GoodData Corporation

import { createFlatKeyCompletions } from "../asCode/keyCompletions.js";

import { COMPUTED_ATTRIBUTE_SCHEMA_KEYS } from "./computedAttributeSchema.js";

export const computedAttributeCompletions = createFlatKeyCompletions(
    COMPUTED_ATTRIBUTE_SCHEMA_KEYS[""]?.keys ?? [],
);
