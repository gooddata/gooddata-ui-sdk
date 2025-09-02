// (C) 2025 GoodData Corporation

import type { IdentifierRef } from "@gooddata/sdk-model";

/**
 * Represents the supported catalog object types in the Analytics Catalog UI.
 *
 * @internal
 */
export type ObjectType = Extract<
    Required<IdentifierRef>["type"],
    "analyticalDashboard" | "insight" | "measure" | "fact" | "attribute"
>;
