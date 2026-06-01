// (C) 2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

let counter = 0;

/**
 * When running e2e tests, we need to generate deterministic tab local identifiers.
 */
export function generateTabLocalIdentifier() {
    if (window?.useSafeLocalIdentifiersForE2e === true) {
        return `test_tab_local_identifier_${counter++}`;
    }

    return uuidv4();
}
