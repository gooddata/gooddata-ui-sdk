// (C) 2021-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

/**
 * @beta
 */
export interface IShowWidgetAsTableState {
    widgetRefs: ObjRef[];
}

/**
 * @beta
 */
export const initialState: IShowWidgetAsTableState = {
    widgetRefs: [],
};
