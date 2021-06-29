// (C) 2019-2021 GoodData Corporation

import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { IDrillToDashboard } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, ObjRef, idRef } from "@gooddata/sdk-model";

import { IDefinitionValidationData, DRILL_TARGET_TYPE, IDrillToDashboardConfig } from "../../interfaces";

import { DrillItem } from "./DrilItem";

export class DrillToDashboardItem extends DrillItem<IDrillToDashboard> {
    constructor(drillData: IDrillToDashboard) {
        super(drillData);
    }
    public getFromLocalIdentifier(): string {
        return this.localIdOrDie(this.data.origin.measure);
    }
    public getTargetRef(): ObjRef | undefined {
        return this.data.target;
    }
    public createConfig(supportedItemsForWidget: IAvailableDrillTargets): IDrillToDashboardConfig {
        return {
            type: "measure",
            localIdentifier: this.getFromLocalIdentifier(),
            title: this.getTitleFromDrillableItemPushData(
                supportedItemsForWidget,
                this.getFromLocalIdentifier(),
            ),
            attributes: this.getAttributes(supportedItemsForWidget),
            drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD,
            dashboard: this.getTargetRef(),
            complete: true,
        };
    }

    private isTargetIdentifierValid(data: IDefinitionValidationData): boolean {
        const targetDashboardRef = this.getTargetRef();

        // Note: a tricky part about drill to dashboard is that the target dashboard is always referenced using
        //  an ID ref. Code cannot just grab dashboard item's ref and compare it with targetDashboardRef.
        return data.dashboardsList.some((i) => areObjRefsEqual(idRef(i.identifier), targetDashboardRef));
    }

    public isItemValid(data: IDefinitionValidationData): boolean {
        return this.isFromLocalIdentifierValid(data) && this.isTargetIdentifierValid(data);
    }
}
