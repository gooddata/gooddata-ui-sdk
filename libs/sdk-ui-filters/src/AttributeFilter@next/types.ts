// (C) 2019-2022 GoodData Corporation

import { IAttributeFilter, ObjRef } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export type OnApplyCallbackType = (filter: IAttributeFilter, isInverted: boolean) => void;

/**
 * @alpha
 */
export type ParentFilterOverAttributeType =
    | ObjRef
    | ((parentFilter: IAttributeFilter, index: number) => ObjRef);
