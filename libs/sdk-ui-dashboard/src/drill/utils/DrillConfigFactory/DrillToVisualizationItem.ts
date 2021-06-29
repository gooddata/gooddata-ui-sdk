// (C) 2019-2021 GoodData Corporation

import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { ObjRef } from "@gooddata/sdk-model";
import { IDrillToInsight } from "@gooddata/sdk-backend-spi";

import { DRILL_TARGET_TYPE, IDefinitionValidationData, IDrillToInsightConfig } from "../../interfaces";

import { DrillItem } from "./DrilItem";

export class DrillToVisualizationItem extends DrillItem<IDrillToInsight> {
    constructor(drillData: IDrillToInsight) {
        super(drillData);
    }
    public getFromLocalIdentifier(): string {
        return this.localIdOrDie(this.data.origin.measure);
    }
    public getTargetRef(): ObjRef {
        return this.data.target;
    }
    public createConfig(supportedItemsForWidget: IAvailableDrillTargets): IDrillToInsightConfig {
        return {
            type: "measure",
            localIdentifier: this.getFromLocalIdentifier(),
            title: this.getTitleFromDrillableItemPushData(
                supportedItemsForWidget,
                this.getFromLocalIdentifier(),
            ),
            attributes: this.getAttributes(supportedItemsForWidget),
            drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_INSIGHT,
            insightRef: this.getTargetRef(),
            complete: true,
        };
    }

    public isItemValid(data: IDefinitionValidationData): boolean {
        return this.isFromLocalIdentifierValid(data);
    }
}
