// (C) 2021-2025 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

/**
 * @beta
 */
export interface ShowWidgetAsTableState {
    widgetRefs: ObjRef[];
}

/**
 * @beta
 */
export const initialState: ShowWidgetAsTableState = {
    widgetRefs: [],
};
