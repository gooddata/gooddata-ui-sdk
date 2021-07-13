// (C) 2021 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";

/**
 * Represent state item of widget reported available drill targets
 * @internal
 */
export interface IDrillTargets {
    /**
     * widget ref
     */
    ref: ObjRef;

    /**
     * widget reported available drill targets
     */
    availableDrillTargets?: IAvailableDrillTargets;
}
