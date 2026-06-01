// (C) 2024-2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

let counter = 0;

/**
 * When running e2e tests, we need to generate deterministic widget local identifiers.
 */
export function generateWidgetLocalIdentifier() {
    if (window?.useSafeLocalIdentifiersForE2e === true) {
        return `test_widget_local_identifier_${counter++}`;
    }

    return uuidv4();
}
