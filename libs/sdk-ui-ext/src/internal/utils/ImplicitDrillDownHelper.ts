// (C) 2007-2021 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IDrillDownDefinition } from "../interfaces/Visualization";

export function drillDownFromAttributeLocalId(drillDefinition: IDrillDownDefinition): string {
    return drillDefinition.origin.localIdentifier;
}

export function drillDownDisplayForm(drillDefinition: IDrillDownDefinition): ObjRef {
    return drillDefinition.target;
}
