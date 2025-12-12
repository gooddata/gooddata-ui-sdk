// (C) 2021 GoodData Corporation
import { type Identifier, type ObjRef } from "@gooddata/sdk-model";
import { type IAvailableDrillTargets } from "@gooddata/sdk-ui";

/**
 * Represent state item of widget reported available drill targets.
 *
 * @alpha
 */
export interface IDrillTargets {
    /**
     * Identifier of widget to which the drills belong.
     */
    identifier: Identifier;

    /**
     * URI of the widget to which the drills belong.
     */
    uri: string;

    /**
     * widget ref
     */
    ref: ObjRef;

    /**
     * widget reported available drill targets
     */
    availableDrillTargets?: IAvailableDrillTargets;
}
