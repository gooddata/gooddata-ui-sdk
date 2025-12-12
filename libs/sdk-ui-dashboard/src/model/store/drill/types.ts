// (C) 2021-2024 GoodData Corporation
import { type ObjRef } from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

/**
 * @beta
 */
export interface ICrossFilteringItem {
    /**
     * Widget reference
     */
    widgetRef: ObjRef | undefined;

    /**
     *  Virtual attribute filter local identifiers added by the widget cross filtering
     */
    filterLocalIdentifiers: string[];

    /**
     * Array of currently selected points.
     * Each point is represented by an array of drill event intersection elements.
     */
    selectedPoints?: IDrillEventIntersectionElement[][];
}
