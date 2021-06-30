// (C) 2019-2021 GoodData Corporation

import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { ObjRef } from "@gooddata/sdk-model";
import { IDrillDownDefinition } from "@gooddata/sdk-ui-ext";

import { IDefinitionValidationData, IDrillConfigItemBase } from "../../interfaces";

import { DrillItem } from "./DrilItem";

export class DrillDownItem extends DrillItem<IDrillDownDefinition> {
    constructor(drillData: IDrillDownDefinition) {
        super(drillData);
    }
    public getFromLocalIdentifier(): string {
        return this.data.origin.localIdentifier;
    }
    public getTargetRef(): ObjRef {
        return this.data.target;
    }
    public createConfig(_supportedItemsForWidget: IAvailableDrillTargets): IDrillConfigItemBase {
        return null as any;
    }

    public isItemValid(_data: IDefinitionValidationData): boolean {
        return true;
    }
}
