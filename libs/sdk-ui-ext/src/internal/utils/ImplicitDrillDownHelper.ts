// (C) 2007-2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

import { IImplicitDrillDown } from "../interfaces/Visualization";

export function drillDownFromAttributeLocalId(drillDefinition: IImplicitDrillDown): string {
    return drillDefinition.implicitDrillDown.from.drillFromAttribute.localIdentifier;
}

export function drillDownDisplayForm(drillDefinition: IImplicitDrillDown): ObjRef {
    return drillDefinition.implicitDrillDown.target.drillToAttribute.attributeDisplayForm;
}
