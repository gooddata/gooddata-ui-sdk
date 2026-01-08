// (C) 2025-2026 GoodData Corporation

import type { ObjRef } from "@gooddata/sdk-model";

/**
 * Parent attribute information extracted from a coordinate display form.
 */
export interface IParentAttributeInfo {
    ref: ObjRef;
    name: string;
    key: string;
}
