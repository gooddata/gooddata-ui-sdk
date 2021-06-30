// (C) 2019-2021 GoodData Corporation

import { IAvailableDrillTargets, IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";
import { IAttributeDescriptor } from "@gooddata/sdk-backend-spi";
import { isLocalIdRef, ObjRefInScope } from "@gooddata/sdk-model";

import { DashboardDrillDefinition, IDefinitionValidationData, IDrillConfigItem } from "../../interfaces";

export abstract class DrillItem<T extends DashboardDrillDefinition> {
    protected data: T;

    constructor(drillData: T) {
        this.data = drillData;
    }
    protected getTitleFromDrillableItemPushData(items: IAvailableDrillTargets, measureId: string): string {
        const measureItems = items.measures || [];
        const res = measureItems.find(
            (x: IAvailableDrillTargetMeasure) => x.measure.measureHeaderItem.localIdentifier === measureId,
        );
        return res ? res.measure.measureHeaderItem.name : "";
    }
    protected getAttributes(supportedItemsForWidget: IAvailableDrillTargets): IAttributeDescriptor[] {
        const measureItems: IAvailableDrillTargetMeasure[] = supportedItemsForWidget.measures || [];
        const supportedItems = measureItems.find(
            (item) => item.measure.measureHeaderItem.localIdentifier === this.getFromLocalIdentifier(),
        );
        return supportedItems ? supportedItems.attributes : [];
    }
    protected isFromLocalIdentifierValid(data: IDefinitionValidationData): boolean {
        const drillSourceIdentifier = this.getFromLocalIdentifier();
        const measureItems = data.supportedDrillableItems.measures || [];
        return measureItems.some(
            (i) => i.measure.measureHeaderItem.localIdentifier === drillSourceIdentifier,
        );
    }
    protected localIdOrDie(ref: ObjRefInScope): string {
        if (isLocalIdRef(ref)) {
            return ref.localIdentifier;
        }

        throw new Error("invalid invariant");
    }

    public abstract getFromLocalIdentifier(): string;
    public abstract createConfig(supportedItemsForWidget: IAvailableDrillTargets): IDrillConfigItem;
    public abstract isItemValid(data: IDefinitionValidationData): boolean;
}
