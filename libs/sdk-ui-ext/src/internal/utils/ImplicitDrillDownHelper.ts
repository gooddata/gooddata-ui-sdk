// (C) 2007-2025 GoodData Corporation
import { type ObjRef } from "@gooddata/sdk-model";

import { type IDrillDownDefinition } from "../interfaces/Visualization.js";

export function drillDownFromAttributeLocalId(drillDefinition: IDrillDownDefinition): string {
    return drillDefinition.origin.localIdentifier;
}

export function drillDownDisplayForm(drillDefinition: IDrillDownDefinition): ObjRef {
    return drillDefinition.target;
}
