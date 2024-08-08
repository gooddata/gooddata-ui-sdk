// (C) 2024 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

let counter = 0;

/**
 * When running e2e tests, we need to generate deterministic widget local identifiers.
 */
export function generateWidgetLocalIdentifier() {
    if (window?.useSafeWidgetLocalIdentifiersForE2e === true) {
        return `test_widget_local_identifier_${counter++}`;
    }

    return uuidv4();
}
