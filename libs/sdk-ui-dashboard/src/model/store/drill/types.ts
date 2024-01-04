// (C) 2021-2023 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

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
}
